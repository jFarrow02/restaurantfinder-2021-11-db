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
        }
    });
    
    return transformedName ? transformedName : name;
};

const stripChars = (name, separator, locatorChars, joiner) => {
    const nameAsArray = name.split(separator);
    let transformedArray;
    let transformedName;
    nameAsArray.forEach((value) => {
        locatorChars.forEach((char, idx) => {
            if(value.indexOf(char) !== -1){
                const target = nameAsArray.indexOf(value);
                transformedName = value.split(char).filter((n) => n !== char).join(joiner);
                nameAsArray[idx] = transformedName;
                transformedArray = nameAsArray.filter((n) => n.indexOf(char) === -1);
                if(name === "Lorenzo & Maria'S") {
                    console.log(nameAsArray);
                    console.log(target + ':' + nameAsArray[target]);
                    console.log(transformedName);
                    console.log(transformedArray);
                }
            }
        });
    });
    return transformedName ? [...transformedArray].join(' ') : name;
};

const buildSqlStatementFromRestaurantRecord = (data) => {
    const textAsArray = data.split('\n');
    const maxIndex = textAsArray.length -1;
    let sqlStatement = '';
    textAsArray.forEach((restaurantRecord, idx) => {
        const recordArray = restaurantRecord.split(',');
        const [ restaurantId, borough, building, cuisine, latitude, longitude, name, street, zip ] = recordArray;
        const sql = `${PREFIX}${restaurantId}, ${borough}, ${building}, ${cuisine}, ${latitude}, ${longitude}, ${name}, ${street}, ${zip}${SUFFIX}`;
        sqlStatement = idx === maxIndex ? sqlStatement + sql : sqlStatement + `${sql}\n`;
    });
    
    return sqlStatement;
};

const convert = async() => {
    try {
        const text = await readFile('./data/restaurants.csv', { encoding: 'utf-8' });
        const sqlStatement = buildSqlStatementFromRestaurantRecord(text);

        writeFile(`${__dirname}/restaurants.sql`, sqlStatement, { encoding: 'utf-8' });
    } catch(err) {
        console.log(err);
    }
};

const convertJSON = async () => {
    const maxIndex = data.length - 1;
    console.log(maxIndex);
    let text = '';
    data.forEach((restaurant, idx) => {
        const {
            restaurant_id: restaurantId,
            address: { building, street, zipcode, coord: [ latitude, longitude]},
            cuisine,
            borough,
        } = restaurant;

        const name = restaurant?.name || 'Name Not Found';
        const transformedName = stripChars(name, ' ', ["'", '`'], '\\');
        const transformedBuilding = stripChars(building, ' ', ['\'', '`'], '\\');
        const transformedStreet = stripChars(street, ' ', ['\'', '`'], '\\').split(' ')
            .filter(s => s.length > 0).join(' ');
       
        text+= idx < maxIndex ? `${restaurantId}, ${borough}, ${transformedBuilding}, ${cuisine.split(',').join('')}, ${latitude}, ${longitude}, ${transformedName}, ${transformedStreet}, ${zipcode}\n` :
        `${restaurantId}, ${borough}, ${transformedBuilding}, ${cuisine.split(',').join(' ')}, ${latitude}, ${longitude}, ${transformedName}, ${transformedStreet}, ${zipcode}`;
    });
    
    try {
        const sqlStatement = buildSqlStatementFromRestaurantRecord(text);
        writeFile(`${__dirname}/restaurants.sql`, sqlStatement, { encoding: 'utf-8' });
    } catch(err) {
        console.log(err);
    }
};

// convert();
convertJSON();