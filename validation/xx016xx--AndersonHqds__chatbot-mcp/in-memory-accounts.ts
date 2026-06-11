class InMemoryAccountsSingleton {
    private static instance: InMemoryAccountsSingleton;
    private accounts: Map<string, number>;

    private constructor() {
        this.accounts = new Map<string, number>();
    }

    public static getInstance(): InMemoryAccountsSingleton {
        if (!InMemoryAccountsSingleton.instance) {
            InMemoryAccountsSingleton.instance = new InMemoryAccountsSingleton();
        }
        return InMemoryAccountsSingleton.instance;
    }

    public getAccountValue(cpf: string): number {
        return this.accounts.get(cpf) || 0;
    }

    public setAccount(cpf: string, value: number, operation: string) {
        if (operation === "add") {
            this.accounts.set(cpf, this.getAccountValue(cpf) + value);
        } else if (operation === "subtract") {
            this.accounts.set(cpf, this.getAccountValue(cpf) - value);
        }
    }
}

export default InMemoryAccountsSingleton;