import Constants from 'expo-constants';
import { Client, Account, Databases, Query } from 'appwrite';

interface Extra {
    apiEndpoint: string;
    databaseId: string;
}
export default class AppwriteService {
    private client: Client;
    private account: Account;
    private databases: Databases;
    
    

    constructor() {
        this.client = new Client();
        const appConfig = Constants.expoConfig?.extra as Extra;

        if (!appConfig) {
            throw new Error('Missing appwrite configuration');
        }

        this.client.setEndpoint(appConfig.apiEndpoint).setProject(appConfig.databaseId);

        this.account = new Account(this.client);
        this.databases = new Databases(this.client);
    }

    async register(email: string, password: string, name: string, username: string) {
        const databaseId = 'your_database_id'; // Zamenjajte z ID-jem vaše baze
        const collectionId = 'usernames'; // ID zbirke "Usernames"

        // Preverite, ali je uporabniško ime že zasedeno
        const existingUsernames = await this.databases.listDocuments(databaseId, collectionId, [
            Query.equal('username', username)
        ]);

        if (existingUsernames.total > 0) {
            throw new Error('Uporabniško ime je že zasedeno.');
        }

        // Ustvarite uporabniški račun
        const user = await this.account.create('unique()', email, password, name);

        // Shranite uporabniško ime v zbirko "Usernames"
        await this.databases.createDocument(databaseId, collectionId, 'unique()', {
            username: username,
            userId: user.$id,
            email: email
        });

        return user;
    }

    async login(email: string, password: string) {
        try {
            // Create a session using email and password
            return await this.account.createEmailPasswordSession(email, password);
        } catch (error) {
            console.error('Login failed:', error); // Log the error for debugging
            // @ts-ignore
            throw new Error(this.extractErrorMessage(error) || 'Login failed. Please try again.');
        }
    }

    async logout() {
        return this.account.deleteSession('current');
    }

    private extractErrorMessage(error: any): string | null {
        return error?.message || null;
    }

    async getCurrentUser() {
        try {
            return await this.account.get();
        } catch (error) {
            console.error('Failed to fetch user:', error);
            throw new Error(this.extractErrorMessage(error) || 'Unable to fetch user details.');
        }
    }

    static getCurrentUser() {
        return new AppwriteService().getCurrentUser();
    }
}