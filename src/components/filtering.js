export function initFiltering(elements) {
    
    // Функция для асинхронного заполнения выпадающих списков, когда данные придут с сервера
    const updateIndexes = (elements, indexes) => {
        Object.keys(indexes).forEach((elementName) => {
            if (elements[elementName]) {
                // Очищаем select от старых опций перед добавлением новых
                elements[elementName].replaceChildren();
                
                // Добавляем дефолтную пустую опцию "Все"
                const defaultOpt = document.createElement('option');
                defaultOpt.value = '';
                defaultOpt.textContent = '-';
                elements[elementName].append(defaultOpt);

                // Перебираем значения индекса
                Object.values(indexes[elementName]).forEach(item => {
                    const el = document.createElement('option');
                    
                    // Проверяем: если item это объект (например, с сервера пришло {id, name}),
                    // берем его свойство name. Если это уже строка — берем её саму.
                    const nameText = typeof item === 'object' && item !== null ? (item.name || item.first_name || Object.values(item)[0]) : item;
                    
                    el.textContent = nameText;
                    el.value = nameText;
                    elements[elementName].append(el);
                });
            }
        });
    }

    // Функция, которая дописывает параметры фильтрации в query перед отправкой на сервер
    const applyFiltering = (query, state, action) => {
        // @todo: #4.2 — обработать очистку поля (переносим из старого кода)
        if (action && action.name === 'clear') {
            const container = action.closest('div') || action.parentElement;
            const input = container.querySelector('input, select');

            if (input) {
                input.value = ''; // Очищаем визуально в браузере
                
                const fieldName = action.dataset.field;
                if (fieldName) {
                    state[fieldName] = '';
                }
            }
        }

        // @todo: #4.5 — собираем активные фильтры для сервера
        const filter = {};
        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                // Ищем только заполненные поля INPUT и SELECT внутри нашего модуля фильтрации
                if (['INPUT', 'SELECT'].includes(elements[key].tagName) && elements[key].value) { 
                    // Формируем ключ в виде filter[searchBySeller], как требует API сервера
                    filter[`filter[${elements[key].name}]`] = elements[key].value; 
                }
            }
        });

        // Если пользователь что-то выбрал, подмешиваем это в query, иначе возвращаем старый query
        return Object.keys(filter).length ? Object.assign({}, query, filter) : query; 
    }

    // Возвращаем две функции
    return {
        updateIndexes,
        applyFiltering
    }
}