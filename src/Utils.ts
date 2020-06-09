class Utils {
    reduce(s: string, length: number): String {
        
        if(length < 1 || length > s.length) {
            throw new Error('Length parameter longer than the string or a negative number.');
        }
        
        const reduced = s.substring(0, length) + '...';

        return reduced;
    }
}

export default new Utils();