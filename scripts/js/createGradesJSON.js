const data = require('../../data/restaurants.json');
const { writeFile } = require('fs/promises');

const getGrades = async (data) => {
    let gradesArray = [];
    let gradeId = 1;
    data.forEach(restaurant => {
        const { grades, restaurant_id: restaurantId } = restaurant;
        grades.forEach(g => {
            let gradeRecord;
            const {
                date: {
                    "$date": gradeDate,
                },
                grade,
                score
            } = g;
            gradeRecord = {
                gradeDate,
                grade: grade < 'F' ? grade : 'F',
                score,
                restaurantId,
                gradeId: `${gradeId}`,
            };
            gradesArray.push(gradeRecord);
            gradeId++;
        });
    });

    gradesArray = gradesArray.filter(grade => grade.grade !== 'Not Yet Graded' && grade.score !== null);
    try {
        await writeFile(`${__dirname}/grades.json`, JSON.stringify(gradesArray), { encoding: 'utf-8'});
    } catch(err) {
        console.log(err);
    }
};

getGrades(data);