import octokit from "./api/octokit.js";
import discord from "./api/discord.js";
import * as state from "./state.js";
import { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder } from "discord.js";

async function fetchPullRequests(repo: string) {
    const [owner, name] = repo.split('/');

    return octokit.pulls.list({
        state: 'open',
        owner,
        repo: name,
    });
}

export async function update() {
    // Fetch all repositories we were added to.
    const repos = await octokit.apps.listReposAccessibleToInstallation();
    const repoNames = repos.data.repositories.map(repo => repo.full_name);
    console.log(`Found repositories: ${repoNames.join(' ')}`);

    // Fetch all open pull requests from all repositories.
    const pullRequests = (await Promise.all(repoNames.map(fetchPullRequests)))
        .flatMap(prs => prs.data)
        .flat();
    console.log(`Found open pull requests: ${pullRequests.map(pr => pr.html_url).join(' ')}`);

    // Fetch all requested reviews from all pull requests.
    const requestedReviews = (await Promise.all(pullRequests.map(async pr => {
        return {
            pr,
            reviewers: await octokit.pulls.listRequestedReviewers({
                owner: pr.base.repo.owner.login,
                repo: pr.base.repo.name,
                pull_number: pr.number,
            }),
        }
    }))).flatMap(data => data.reviewers.data.users.map(user => ({ ...user, pr: data.pr })));
    console.log(`Found requested reviews for GitHub users: ${requestedReviews.map(rr => rr.login).join(' ')}`);

    // Check the state of each of the requested reviews.
    for (const review of requestedReviews) {
        const developer = state.data.find(developer => developer.githubUsername === review.login);
        if (!developer) {
            console.warn(`No registered developer found for GitHub user ${review.login}`);
            continue;
        }

        // Check if this review is already pending.
        let pending = developer.pendingReviews.find(pr => pr.pullRequestURL === review.pr.html_url);
        if (pending) {
            if (pending.nextNotificationTime > Date.now()) {
                console.log(`Review for developer ${review.login} at ${review.pr.html_url} is already pending and not due for another notification`);
                continue;
            }
        } else {
            pending = {
                pullRequestURL: review.pr.html_url,
                nextNotificationTime: 0,
            };
            developer.pendingReviews.push(pending);
        }

        // Only notify again after 24 hours.
        pending.nextNotificationTime = Date.now() + 1000 * 60 * 60 * 24;

        // Send a message to the developer's DMs on Discord.
        try {
            const discordUser = await discord.users.fetch(developer.discordId);

            const embed = new EmbedBuilder()
                .setColor('#005599')
                .setTitle(review.pr.title)
                .setURL(review.pr.html_url)
                .setDescription(
                    `Your review has been requested for **${review.pr.user.login}**'s [pull request](${review.pr.html_url}).\n` +
                    `Try to review it as soon as possible!`)
                .setTimestamp();

            const select = new StringSelectMenuBuilder()
                .setCustomId('reminder')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Remind me again in 3 hours')
                        .setValue('3h')
                        .setEmoji('⏰'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Remind me again in 1 day')
                        .setValue('1d')
                        .setEmoji('⏰')
                        .setDefault(true),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Remind me again in 3 days')
                        .setValue('3d')
                        .setEmoji('⏰'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Remind me again in 5 days')
                        .setValue('5d')
                        .setEmoji('⏰')
                );

            const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

            await discordUser.send({ embeds: [embed], components: [row] });
            console.log(`Sent a reminder to developer ${developer.githubUsername} for review at ${review.pr.html_url}`);
        } catch (error) {
            console.error(`Failed to send a reminder to developer ${developer.githubUsername} for review at ${review.pr.html_url}`);
            console.error(error);
        }
    }

    // Clean up any pending reviews which were already completed.
    for (const developer of state.data) {
        developer.pendingReviews = developer.pendingReviews.filter(pr => {
            return requestedReviews.some(rr => rr.login === developer.githubUsername && rr.pr.html_url === pr.pullRequestURL);
        });
    }

    state.save();
}

function parseTime(time: string) {
    const unit = time[time.length - 1];
    const value = parseInt(time.slice(0, -1));
    switch (unit) {
        case 'h': return value * 1000 * 60 * 60;
        case 'd': return value * 1000 * 60 * 60 * 24;
    }
}

export async function select(interaction: StringSelectMenuInteraction) {
    const prURL = interaction.message.embeds[0].url;
    const developer = state.data.find(developer => developer.discordId === interaction.user.id);

    console.log(`${interaction.user.globalName} selected ${interaction.values[0]} for review reminder of PR ${prURL}`);

    if (!developer) {
        console.warn(`No registered developer found for Discord user ${interaction.user.globalName}`);
        interaction.reply({ content: 'You are not registered as a developer.', ephemeral: true });
        return;
    }

    const pending = developer.pendingReviews.find(pr => pr.pullRequestURL === prURL);
    if (!pending) {
        console.warn(`No pending review found for developer ${developer.githubUsername} at ${prURL}`);
        interaction.reply({ content: 'Review is no longer pending.', ephemeral: true });
        return;
    }

    const time = parseTime(interaction.values[0]);
    pending.nextNotificationTime = Date.now() + time;

    state.save();

    if (time > parseTime('1d')) {
        const days = Math.round(time / (1000 * 60 * 60 * 24));

        await octokit.issues.createComment({
            owner: prURL.split('/')[3],
            repo: prURL.split('/')[4],
            issue_number: parseInt(prURL.split('/')[6]),
            body: `@${developer.githubUsername} will only be able to review this PR in ${days} days.`,
        })
    }

    interaction.reply({ content: 'Reminder has been updated.', ephemeral: true });
}