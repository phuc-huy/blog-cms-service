import { useState, useEffect } from 'react';

// Custom hook useDebounce
function useDebounce(value, delay) {
    // State và setter cho giá trị đã debounce
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Thiết lập một timer để cập nhật giá trị debounce sau delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Dọn dẹp timer nếu giá trị hoặc delay thay đổi
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;
