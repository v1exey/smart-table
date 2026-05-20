import {sortMap} from "../lib/sort.js"; // sortCollection больше не нужен, удаляем его из импорта

export function initSorting(columns) {
    return (query, state, action) => { // Переименовали первый аргумент data в query
        let field = null;
        let order = null;

        if (action && action.name === 'sort') {
            // @todo: #3.1 — запомнить выбранный режим сортировки
            action.dataset.value = sortMap[action.dataset.value]; // Переключаем значение в датасете по кругу
            field = action.dataset.field;                         // Получаем имя поля
            order = action.dataset.value;                         // Получаем новое направление сортировки

            // @todo: #3.2 — сбросить сортировки остальных колонок
            columns.forEach(column => {                                    
                if (column.dataset.field !== action.dataset.field) {    
                    column.dataset.value = 'none';                        
                }
            }); 
        } else {
            // @todo: #3.3 — получить выбранный режим сортировки
            columns.forEach(column => {                        
                if (column.dataset.value !== 'none') {        
                    field = column.dataset.field;            
                    order = column.dataset.value;            
                }
            }); 
        }

        // Формируем параметр сортировки в виде строки "имя_поля:направление", если сортировка активна
        const sort = (field && order !== 'none') ? `${field}:${order}` : null; 

        // По общему принципу: если есть сортировка — подмешиваем в query, если нет — возвращаем query без изменений
        return sort ? Object.assign({}, query, { sort }) : query; 
    }
}