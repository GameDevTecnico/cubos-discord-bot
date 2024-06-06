import "dotenv/config";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import * as fs from "fs";

export default new Octokit({
    authStrategy: createAppAuth,
    auth: {
        appId: process.env.GITHUB_APP_ID,
        privateKey: fs.readFileSync(process.env.GITHUB_PRIVATE_KEY).toString(),
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        installationId: process.env.GITHUB_INSTALLATION_ID,
    }
});
