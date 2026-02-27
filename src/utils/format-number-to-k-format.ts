export function convertToKFormat(number: number) {
    if (number >= 1000) {
        return (number / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return number.toString();
}

export function formatVnd(num: number){
    return (num * 1000).toLocaleString('vi-VN')
}
