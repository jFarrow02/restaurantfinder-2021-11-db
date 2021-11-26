const data = require('../../data/restaurants.json');
const { writeFile } = require('fs/promises');

const getRestaurantsJSON = async (data) => {
    let restaurants = [];
    let cuisineTypes = [];

    data.forEach(restaurant => {
        let record;
        const {
            address: {
                building,
                street,
                coord: [
                    latitude,
                    longitude,
                ],
                zipcode,
            },
            borough,
            cuisine,
            name,
            restaurant_id: restaurantId
        } = restaurant;


        const nameAsArray = name.split(' ');
        const displayName = [...nameAsArray];

        nameAsArray.forEach((n, index) => {
            if(n.indexOf("'S") !== -1){
                displayName[index] = displayName[index].substring(0, displayName[index].indexOf("'")) + "'s";
            }
        });

        record = {
            building,
            street: street.split(' ').filter(s => s!== '').join(' '),
            latitude,
            longitude,
            zipcode,
            borough,
            cuisine,
            name: displayName.join(' '),
            restaurantId,
        }
        restaurants.push(record);

        if(cuisineTypes.indexOf(cuisine) === -1){
            cuisineTypes.push(cuisine);
        }
    });

    restaurants = restaurants.filter(r => r.building && r.street && r.latitude && r.longitude && r.zipcode
            && r.borough && r.cuisine && r.name && r.restaurantId
        );

    cuisineTypes =cuisineTypes.map((c, idx) => { return { cuisineType: c, cuisineId: idx }}).sort((a, b) => {
        if(a.cuisineType < b.cuisineType) {
            return -1;
        }
        if (b.cuisineType < a.cuisineType) {
            return 1;
        }
        return 0;
    });

    try {
        await writeFile(`${__dirname}/restaurants.json`, JSON.stringify(restaurants), { encoding: 'utf-8' });
        await writeFile(`${__dirname}/cuisine-types.json`, JSON.stringify(cuisineTypes), { encoding: 'utf-8' });
    } catch (err) {
        console.log(err);
    }
};

getRestaurantsJSON(data);