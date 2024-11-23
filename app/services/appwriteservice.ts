import { Client, Account } from 'appwrite';
import Constants from 'expo-constants';

class AppwriteService {
    private client: Client;
    private account: Account;

    constructor() {
        this.client = new Client();

        const { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } = Constants.expoConfig?.extra || {};

        if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
            throw new Error('Appwrite configuration is missing');
        }

        this.client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);

        this.account = new Account(this.client);
    }

    async register(email: string, password: string, name: string) {
        return this.account.create('unique()', email, password, name);
    }

    async login(email: string, password: string) {
        try {
            // Create a session using email and password
            return await this.account.createEmailPasswordSession(email, password);
        } catch (error) {
            console.error('Login failed:', error); // Log the error for debugging
            // @ts-ignore
            throw new Error(error.message || 'Login failed. Please try again.');
        }
    }


    async logout() {
        return this.account.deleteSession('current');
    }

    async getCurrentUser() {
        return this.account.get();
    }
}

export default new AppwriteService();