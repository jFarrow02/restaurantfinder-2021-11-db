const { readFile, writeFile } = require('fs/promises');
const data = require('../../data/restaurants.json');

const PREFIX = 'INSERT INTO RESTAURANTS(RESTAURANT_ID, BOROUGH, BUILDING, CUISINE, LATITUDE, LONGITUDE, NAME, STREET, ZIP) VALUES (';
const SUFFIX = ');'

const escapedApostrophe = '\\\'';

const transformRestaurantName = (name) => {
    const nameAsArray = name.split(' ');
    let transformedName;
    nameAsArray.forEach((value) => {
        if(value.indexOf(escapedApostrophe) !== -1) {
            transformedName = value.split(escapedApostrophe).filter((n) => n !== escapedApostrophe).join('\\');
            console.log(transformedName);
        }
    });
    
    return transformedName ? transformedName : name;
};

const trimStreetName = (name) => {
    return name.split(' ').filter((streetName) => streetName.trim().length > 0).join(' ');
}

const buildSqlStatementFromRestaurantRecord = (data) => {
    const textAsArray = data.split('\n');
    const maxIndex = textAsArray.length -1;
    let sqlStatement = '';
    textAsArray.forEach((restaurantRecord, idx) => {
        const recordArray = restaurantRecord.split(',');
        const [ restaurantId, borough, building, cuisine, latitude, longitude, name, street, zip ] = recordArray;
        const transformedName = transformRestaurantName(name)
        const trimmedStreet = trimStreetName(street);
        
        const sql = `${PREFIX}${restaurantId}, ${borough}, ${building}, ${cuisine}, ${latitude}, ${longitude}, ${transformedName}, ${trimmedStreet}, ${zip}${SUFFIX}`;
        sqlStatement = idx === maxIndex ? sqlStatement + sql : sqlStatement + `${sql}\n`;
    });
    
    return sqlStatement;
};

const convert = async() => {

    let sqlStatement = '';

    try {
        const text = await readFile('./data/restaurants.csv', { encoding: 'utf-8' });
        const textAsArray = text.split('\n');
        const maxIndex = textAsArray.length - 1;

        // textAsArray.forEach((restaurantRecord, idx) => {
        //     const recordArray = restaurantRecord.split(',');
        //     const [ restaurantId, borough, building, cuisine, latitude, longitude, name, street, zip ] = recordArray;
            
        //     const trimmedStreet = trimStreetName(street);
            
        //     const transformedName = transformRestaurantName(name);

        //     const sql = `${PREFIX}${restaurantId}, ${borough}, ${building}, ${cuisine}, ${latitude}, ${longitude}, ${transformedName}, ${trimmedStreet}, ${zip}${SUFFIX}`;
        //     sqlStatement = idx === maxIndex ? sqlStatement + sql : sqlStatement + `${sql}\n`;
        // });
        const sqlStatement = buildSqlStatementFromRestaurantRecord(text);

        writeFile(`${__dirname}/restaurants.sql`, sqlStatement, { encoding: 'utf-8' });
    } catch(err) {
        console.log(err);
    }
};

const convertJSON = async () => {
    let sqlStatement = '';
    const dataAsJSON = JSON.parse(data);

    dataAsJSON.forEach((restaurant, idx) => {
        const {
            restaurant_id: restaurantId,
            address: { building, street, zipcode, coord: [ latitude, longitude]},
            name,
            cuisine,
            borough,
        } = restaurant;

        const sql = `${PREFIX}${restaurantId}, ${borough}, ${building}, ${cuisine}, ${latitude}, ${longitude}, ${name}, ${street}, ${zipcode}${SUFFIX}`;

    });
    
    
};

convert();