const data = require('../../data/restaurants.json');
const { writeFile } = require('fs/promises');

const isValidString = (s) => {
    return s.length > 0;
};

const isNotNull = (val) => {
    return val !== null && val !== undefined;
};

const isValidZipcode = (zip) => {

};

const getRandomIndex = (max, min) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
};

const getRestaurantsJSON = async (data) => {
    let restaurants = [];
    let cuisineTypes = [];
    let zipcodes = {};
    let alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
        'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
    ];
    let restaurantsByName = {
        a: [], b: [], c: [], d: [], e: [], f: [], g: [], h: [], i: [], j:[], k: [], l: [],
        m: [], n: [], o: [], p: [], q: [], r: [], s: [], t: [], u: [], v: [], w: [], x: [],
        y: [], z: [], special: [],
    };

    // Build dummy phone numbers
    const AREA_CODE = '777';
    const FIRST_THREE = '555';
    const PHONE_NUMBERS = [];

    for(let i = 100; i < 200; i++) {
        PHONE_NUMBERS.push(`${AREA_CODE}.${FIRST_THREE}.0${i}`);
    };

    data.forEach(restaurant => {
        let record;
        const {
            address: {
                building,
                street,
                coord: [
                    longitude,
                    latitude,
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
            phone: PHONE_NUMBERS[getRandomIndex(0, 100)],
        }

        // Filter out null records
        if(
            (isNotNull(building) && isValidString(building)) &&
            (isNotNull(street) && isValidString(street)) &&
            (isNotNull(latitude)) &&
            (isNotNull(longitude)) &&
            (isNotNull(zipcode) && isValidString(zipcode)) &&
            (isNotNull(borough) && isValidString(borough))
        )
        {
            restaurants.push(record);
        }
        

        Object.keys(restaurantsByName).forEach((key) => {
            if(record.name.substring(0, 1).toLowerCase() === key) {
                restaurantsByName[key].push(record);
            } else if(!alphabet.includes(record.name.substring(0, 1).toLowerCase())){
                restaurantsByName['special'].push(record);
            }
        })

        if(cuisineTypes.indexOf(cuisine) === -1){
            cuisineTypes.push(cuisine);
        }

        if(!Object.keys(zipcodes).includes(zipcode)){
            zipcodes[zipcode] = { zipcode: zipcode };
        }
    });

    restaurants = restaurants.filter(r => r.building && r.street && r.latitude && r.longitude && r.zipcode
            && r.borough && r.cuisine && r.name && r.restaurantId
        );

    cuisineTypes = cuisineTypes.map((c, idx) => { return { cuisineType: c, cuisineId: idx.toString() }}).sort((a, b) => {
        if(a.cuisineType < b.cuisineType) {
            return -1;
        }
        if (b.cuisineType < a.cuisineType) {
            return 1;
        }
        return 0;
    });

    let zipCodesArray = Object.keys(zipcodes).map((zip) => ({zip})).filter(zip => zip.zip !== '');

    try {
        await writeFile(`${__dirname}/restaurants.json`, JSON.stringify(restaurants), { encoding: 'utf-8' });
        await writeFile(`${__dirname}/cuisine-types.json`, JSON.stringify(cuisineTypes), { encoding: 'utf-8' });
        await writeFile(`${__dirname}/restaurants-by-name.json`, JSON.stringify([restaurantsByName]), { encoding: 'utf-8' });
        await writeFile(`${__dirname}/zipcodes.js`, JSON.stringify(zipCodesArray), { encoding: 'utf-8'});
        // for(let n in restaurantsByName) {
        //     await writeFile(`${__dirname}/restaurants-${n}.json`, JSON.stringify(restaurantsByName[n]), { encoding: 'utf-8'});
        // }
    } catch (err) {
        console.log(err);
    }
};

getRestaurantsJSON(data);