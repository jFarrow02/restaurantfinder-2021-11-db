const data = require('../../data/restaurants.json');
const { writeFile } = require('fs/promises');

const getRestaurantsJSON = async (data) => {
    const restaurants = [];
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

        record = {
            building,
            street,
            latitude,
            longitude,
            zipcode,
            borough,
            cuisine,
            name,
            restaurantId,
        }
        restaurants.push(record);
    });

    try {
        await writeFile(`${__dirname}/restaurants.json`, JSON.stringify(restaurants), { encoding: 'utf-8' });
    } catch (err) {
        console.log(err);
    }
};

getRestaurantsJSON(data);