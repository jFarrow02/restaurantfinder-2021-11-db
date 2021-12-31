const data = require('../../data/reviews.json');
const grades = require('./grades.json');
const { writeFile } = require('fs/promises');

// const JAN_01_2019 = 49 * 365.25 * 24 * 60 * 60 * 1000;
// const JAN_01_2022 = 52 * 365.25 * 24 * 60 * 60 * 1000;

const createReviews = async () => {
    const reviewsList = [];

    for(let i = 0; i < grades.length; i++) {
        const review = {
            restaurantId: grades[i].restaurantId,
            reviewDate: grades[i].gradeDate,
            gradeId: grades[i].gradeId,
            reviewText: data.reviews[Math.floor(Math.random() * (data.reviews.length - 0) + 0)],
            reviewer: data.reviewers[Math.floor(Math.random() * (data.reviewers.length - 0) + 0)],
        };

        reviewsList.push(review);
        
    }

    try{
        await writeFile(`${__dirname}/reviews.json`, JSON.stringify(reviewsList), { encoding: 'utf-8'});
    } catch(err) {
        console.log(err);
    }
};

createReviews();