let dataSet = [];
let pointsHandler;
axios.get('https://demonstration.org.ua/laravel/public/points-get').then((response) => {
    console.log(response.data)
    pointsHandler = response.data;
    pointsHandler.forEach(point => {
        let workingTime = point.open247 ? '24/7' : 'не кргулосуточно';
        let kvt = point.kvt ? point.kvt : 'нет информации';
        dataSet.push([
            kvt,
            point.poi_name,
            point.name,
            workingTime,
            point.address,
            point.phone,
            point.valid_outlets.length,
        ]);
    });
    creatRable()
});



function creatRable(){
    console.log(dataSet)
    $('#example').DataTable({
        data: dataSet,
        columns: [
            { title: 'КВт' },
            { title: 'Название' },
            { title: 'Полное название' },
            { title: 'Время работы' },
            { title: 'Адрес' },
            { title: 'Телефон' },
            { title: 'Кол-во станций' },
        ],
    });
}