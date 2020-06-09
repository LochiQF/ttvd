import ora, { Ora } from 'ora'

class Spinner {
    private spinner: Ora;
    
    constructor() {
        this.spinner = ora();
    }
    
    succeed(msg?: string) {
        this.spinner.succeed(msg);
    }
    
    update(msg: string) {
        this.spinner.text = msg;
        this.spinner.start();
    }
    
    fail(msg: string, error: Error) {
        this.spinner.fail(msg); 
        console.error(error.message);
        
        process.exit(1);
    }
}

export default new Spinner();