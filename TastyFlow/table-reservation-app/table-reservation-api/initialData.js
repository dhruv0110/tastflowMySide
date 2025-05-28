// You can use a script like this to insert initial data into your MongoDB database

const mongoose = require('mongoose');
const Table = require('./models/Table');

const mongoUrl = "mongodb://127.0.0.1:27017/register?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.0.1";


const connectToMongo = () => {
    main()
    .then(() => {
      // console.log("connected to mongo successfully");
    })
    .catch((err) => console.log(err));
  async function main() {
    await mongoose.connect(mongoUrl);
  }
}
connectToMongo();

const seedTables = async () => {
  await Table.deleteMany({});
  const tables = [
    { number: 1, reserved: false },
    { number: 2, reserved: false },
    { number: 3, reserved: false },
  ];
  await Table.insertMany(tables);
  // console.log('Tables seeded!');
  mongoose.connection.close();
};

seedTables();
