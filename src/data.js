import {makeIndex} from "./lib/utils.js";

const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

export function initData(sourceData) {
    // Переменные для кеширования данных, чтобы не слать запросы в сеть повторно без необходимости
    let sellers;
    let customers;
    let lastResult;
    let lastQuery;

    // Функция для маппинга (преобразования) серверных данных в формат, с которым работает таблица
    const mapRecords = (data) => data.map(item => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id],
        customer: customers[item.customer_id],
        total: item.total_amount
    }));

    // Асинхронное получение справочников продавцов и покупателей с сервера
    const getIndexes = async () => {
        if (!sellers || !customers) { // Загружаем данные только один раз при старте приложения
            // Делаем параллельные fetch-запросы с помощью Promise.all для экономии времени
            [sellers, customers] = await Promise.all([ 
                fetch(`${BASE_URL}/sellers`).then(res => res.json()), 
                fetch(`${BASE_URL}/customers`).then(res => res.json()), 
            ]);
        }

        return { sellers, customers };
    }

    // Асинхронное получение записей с сервера с учетом параметров фильтрации/сортировки/пагинации
    const getRecords = async (query, isUpdated = false) => {
        // Преобразуем JS-объект параметров в строку вида ?page=1&limit=10
        const qs = new URLSearchParams(query); 
        const nextQuery = qs.toString(); 

        // Кеширование: если параметры запроса не поменялись с прошлого раза, возвращаем старый результат
        if (lastQuery === nextQuery && !isUpdated) { 
            return lastResult; 
        }

        // Если параметров не было или они изменились — делаем новый сетевой запрос
        const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
        const records = await response.json();

        // Сохраняем новые данные в кеш
        lastQuery = nextQuery; 
        lastResult = {
            total: records.total,
            items: mapRecords(records.items) // Превращаем сырые id продавцов в их имена с помощью маппера
        };

        return lastResult;
    };

    // Возвращаем методы для работы во внешнем мире (в main.js)
    return {
        getIndexes,
        getRecords
    }; 
}