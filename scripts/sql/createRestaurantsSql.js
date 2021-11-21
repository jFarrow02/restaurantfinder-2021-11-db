const { readFile, writeFile } = require('fs/promises');
const data = require('../../data/restaurants.json');

const PREFIX = 'INSERT INTO RESTAURANTS(RESTAURANT_ID, BOROUGH, BUILDING, CUISINE, LATITUDE, LONGITUDE, RESTAURANT_NAME, STREET, ZIP) VALUES (';
const SUFFIX = ');'

const stripChars = (name, separator, locatorChars, joiner) => {
    const nameAsArray = name.split(separator);
    let transformedArray = [...nameAsArray];
    let transformedName;
    // if(name === "Chic-Fil-A, Quiznos Subs, Jw'S, Tossed") {
    //     console.log(nameAsArray); // [ 'Chic-Fil-A,', 'Quiznos', 'Subs,', "Jw'S,", 'Tossed' ]
    // }
    nameAsArray.forEach((value, valueIndex) => {
        // if(name === "Chic-Fil-A, Quiznos Subs, Jw'S, Tossed") {
        //     console.log(valueIndex + ":" + nameAsArray[valueIndex]);
        //     // 0:Chic-Fil-A,
        //     // 1:Quiznos
        //     // 2:Subs,
        //     // 3:Jw'S,
        //     // 4:Tossed
        // }
        
        // if(name === "Chic-Fil-A, Quiznos Subs, Jw'S, Tossed") {
        //     console.log(transformedArray);
        // }
        locatorChars.forEach((char) => {
            if(value.indexOf(char) !== -1){
                transformedName = value.split(char).filter((n) => n !== char).join(joiner);
                transformedArray[valueIndex] = transformedName;
            }
        });
    });
    // if(name === "Chic-Fil-A, Quiznos Subs, Jw'S, Tossed") {
    //     console.log(transformedArray); // [ 'Chic-Fil-A,', 'Quiznos', 'Subs,', 'Jw\\S,', 'Tossed' ]
    // }
    return transformedName ? [...transformedArray].join(' ') : name;
};

// const buildSqlStatementFromRestaurantRecord = (data) => {
//     const textAsArray = data.split('\n');
//     const maxIndex = textAsArray.length -1;
//     let sqlStatement = '';
//     textAsArray.forEach((restaurantRecord, idx) => {
//         const recordArray = restaurantRecord.split(',');
//         const [ restaurantId, borough, building, cuisine, latitude, longitude, name, street, zip ] = recordArray;
//         const sql = `${PREFIX}'${restaurantId}, ${borough}, ${building}, ${cuisine}, ${latitude}, ${longitude}, ${name}, ${street}, ${zip}${SUFFIX}`;
//         sqlStatement = idx === maxIndex ? sqlStatement + sql : sqlStatement + `${sql}\n`;
//     });
    
//     return sqlStatement;
// };
const buildSqlStatementFromRestaurantRecord = (data) => {
    const textAsArray = data.split('\n');
    const maxIndex = textAsArray.length -1;
    let sqlStatement = '';
    textAsArray.forEach((statement, idx) => {
        const sql = `${PREFIX}${statement}${SUFFIX}`;
        //sqlStatement+= sql;

        // const recordArray = restaurantRecord.split(',');
        // const [ restaurantId, borough, building, cuisine, latitude, longitude, name, street, zip ] = recordArray;
        // const sql = `${PREFIX}'${restaurantId}, ${borough}, ${building}, ${cuisine}, ${latitude}, ${longitude}, ${name}, ${street}, ${zip}${SUFFIX}`;
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

        if(restaurantId === '40634715') {
            console.log(transformedName);
        }
       
        text+= idx < maxIndex ? `'${restaurantId}', '${borough}', '${transformedBuilding}', '${cuisine.split(',').join('')}', ${latitude}, ${longitude}, '${transformedName}', '${transformedStreet}', '${zipcode}'\n` :
        `'${restaurantId}', '${borough}', '${transformedBuilding}', '${cuisine.split(',').join(' ')}', ${latitude}, ${longitude}, '${transformedName}', '${transformedStreet}', '${zipcode}'`;
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