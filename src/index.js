const { MongoClient } = require("mongodb");

async function main() {

    const uri = "mongodb://127.0.0.1:27017/";

    const client = new MongoClient(uri);

    try {
        // Setup connection with DB
        await client.connect();

        await createMultipleEmployees(client,[
            {
                name: "Max",
                age: 31,
                salary: 30000,
                company: "ABC.Inc"
            },
            {
                name: "Mahtew",
                age: 29,
                salary: 35000,
                company: "ABC.Inc"
            },
            {
                name: "Rose",
                age: 30,
                salary: 30000,
                company: "ABC.Inc"
            }
        ]);

        await findEmployeesByAge(client, 29);

        await upsertEmployeeByName(client, "cherry", {name: "cherry", age: 32, salary: 36000, company: "ABC.Inc"});

        await deleteFromEmployee(client);

    } catch {
        console.error(e);
    }  finally {
        // Close DB connection 
        await client.close();
    }
}

main().catch(console.error);

// Create a document in DB
async function createMultipleEmployees(client, newListings){
    const result = await client.db("company").collection("Employees").insertMany(newListings);

    console.log(result.insertedCount+' new listing(s) created with following id(S):');
    console.log(result.insertedIds);
}

// Read a document from DB
async function findEmployeesByAge(client, minimumAge) {
    const cursor = await client.db("company").collection("Employees").find({
        age: {$gt: minimumAge}
    });

    const results = await cursor.toArray();

    if(results.length > 0) {
        console.log('Found Employees with at least '+(minimumAge+1)+' of age are:');
        results.forEach((result, i) => {
            console.log();
            console.log((i + 1 )+'. _id: '+result._id);
            console.log('  name: '+result.name);
            console.log('  age: '+result.age);
            console.log('  salary: '+result.salary);
            console.log('  company: '+result.company);
        });
    } else {
        console.log('No employee found of  age greater than '+minimumAge);
    }
}

// Update or insert Employee base on his name criteria
async function upsertEmployeeByName(client, empName, updateList) {
    const result = await client.db("company").collection("Employees").
                    updateOne({ name: empName}, 
                                {$set: updateList}, 
                                {upsert: true});
    console.log(result.matchedCount+' document(s) matched the query criteria.');

    if (result.upsertedCount > 0) {
        console.log('One document was inserted with the id '+result.upsertedId);
    } else {
        console.log(result.modifiedCount+' document(s) was/were updated.');
    }
}

// Delete all records from Employee
async function deleteFromEmployee(client) {
    const result = await client.db("company").collection("Employees").deleteMany({});

    console.log(result.deletedCount+ ' document(s) was/were deleted.');
}