const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Replace with your MongoDB connection string
const mongoURI = 'your_mongodb_connection_string';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const submissionSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    timeTaken: Number,
    answers: Object,
    points: Number,
    rank: Number
});

const Submission = mongoose.model('Submission', submissionSchema);

app.post('/submitQuiz', async (req, res) => {
    const { name, email, phone, timeTaken, answers, points } = req.body;

    const newSubmission = new Submission({ name, email, phone, timeTaken, answers, points });

    try {
        await newSubmission.save();

        // Calculate ranks
        const submissions = await Submission.find().sort({ points: -1, timeTaken: 1 });
        submissions.forEach((submission, index) => {
            submission.rank = index + 1;
            submission.save();
        });

        res.status(200).send('Quiz submitted successfully');
    } catch (error) {
        console.error('Error submitting quiz: ', error);
        res.status(500).send('Error submitting quiz');
    }
});

app.get('/leaderboard', async (req, res) => {
    try {
        const submissions = await Submission.find().sort({ points: -1, timeTaken: 1 });
        res.status(200).json(submissions);
    } catch (error) {
        console.error('Error fetching leaderboard: ', error);
        res.status(500).send('Error fetching leaderboard');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
