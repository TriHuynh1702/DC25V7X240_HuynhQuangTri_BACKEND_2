
const { ObjectId } = require("mongodb");

class ContactService {
    constructor(client) {
        this.Contact = client.db().collection("contacts");
    }

    extractContactData(payload) {
        const contact = {
            name: payload.name,
            email: payload.email,
            address: payload.address,
            phone: payload.phone,
            favorite: payload.favorite,
        };

        Object.keys(contact).forEach(
            (key) => contact[key] === undefined && delete contact[key]
        );

        return contact;
    }

    async create(payload) {
        const contact = this.extractContactData(payload);
        const result = await this.Contact.insertOne(contact);
        return result.insertedId;
    }

    async find(filter) {
        const cursor = await this.Contact.find(filter);
        return await cursor.toArray();
    }

    async findByName(name) {
        return await this.find({
            name: { $regex: name, $options: "i" },
        });
    }

    async findById(id) {
        if (!ObjectId.isValid(id)) return null;

        return await this.Contact.findOne({
            _id: new ObjectId(id),
        });
    }

    async update(id, payload) {
        if (!ObjectId.isValid(id)) return null;

        const result = await this.Contact.updateOne(
            { _id: new ObjectId(id) },
            { $set: this.extractContactData(payload) }
        );

        if (result.matchedCount === 0) return null;

        return await this.findById(id);
    }

    async delete(id) {
        if (!ObjectId.isValid(id)) return null;

        const result = await this.Contact.findOneAndDelete({
            _id: new ObjectId(id),
        });

        return result;
    }

    async deleteAll() {
        const result = await this.Contact.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = ContactService;
