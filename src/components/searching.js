export function initSearching(searchField) {
    // Вся инициализация компаратора #5.1 удалена

    return (query, state, action) => {
        // Проверяем, что в поле поиска было что-то введено
        return state[searchField] ? Object.assign({}, query, { 
            search: state[searchField] // Устанавливаем в query параметр для сервера
        }) : query; // Если поле поиска пустое, возвращаем query без изменений
    }
}