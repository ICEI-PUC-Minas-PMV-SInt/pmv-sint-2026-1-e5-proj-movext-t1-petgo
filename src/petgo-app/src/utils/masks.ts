export const maskPhone = (value: string) => {
    value = value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 10) {
        return value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    } else if (value.length > 6) {
        return value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else if (value.length > 2) {
        return value.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
    } else {
        return value.replace(/^(\d*)/, "($1");
    }
};

export const maskCPF = (value: string) => {
    value = value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    return value
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

export const maskCNPJ = (value: string) => {
    value = value.replace(/\D/g, "");
    if (value.length > 14) value = value.slice(0, 14);
    
    return value
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
};

export const maskDate = (value: string) => {
    value = value.replace(/\D/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    
    return value
        .replace(/(\d{2})(\d)/, "$1/$2")
        .replace(/(\d{2})(\d)/, "$1/$2");
};

export const maskTime = (value: string) => {
    value = value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    
    return value
        .replace(/(\d{2})(\d)/, "$1:$2");
};
