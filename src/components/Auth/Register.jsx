const [errors, setErrors] = useState({});

const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) newErrors.username = 'Введите логин';
    else if (formData.username.length < 3) newErrors.username = 'Логин должен быть не менее 3 символов';
    
    if (!formData.password) newErrors.password = 'Введите пароль';
    else if (formData.password.length < 6) newErrors.password = 'Пароль должен быть не менее 6 символов';
    
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Пароли не совпадают';
    
    if (!formData.full_name) newErrors.full_name = 'Введите ФИО';
    
    if (!formData.birth_date) newErrors.birth_date = 'Выберите дату рождения';
    else {
        const age = new Date().getFullYear() - new Date(formData.birth_date).getFullYear();
        if (age < 0 || age > 120) newErrors.birth_date = 'Некорректная дата рождения';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Введите корректный email';
    }
    
    if (formData.phone && !/^[\d\s+()-]{10,}$/.test(formData.phone)) {
        newErrors.phone = 'Введите корректный номер телефона';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};
