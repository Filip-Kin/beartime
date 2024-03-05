export function getTime() {
    return new Date(new Date().getTime() - 5 * 60 * 60 * 1000);
}
