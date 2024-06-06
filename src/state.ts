import * as fs from 'fs';

export type PendingReview = {
    pullRequestURL: string;
    nextNotificationTime: number;
};

export type Developer = {
    discordId: string;
    githubUsername: string;
    pendingReviews: PendingReview[];
}

export type State = Developer[];

function loadState(): State {
    try {
        return JSON.parse(fs.readFileSync('state.json', 'utf-8'));
    } catch {
        console.error('Could not parse state.json, falling back to empty state');
        return [];
    }
}

function saveState(state: State) {
    fs.writeFileSync('state.json', JSON.stringify(state, null, 4));
}

export const data = loadState();
export const save = () => saveState(data);
