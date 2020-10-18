import { Client, ThreadID, Update } from '@textile/hub';

export interface Model {
    _id: string
}

export class Repository<T extends Model> {

    constructor(private collectionName: string, private db: Client, private threadId: ThreadID) {}

    public async findById(id: string): Promise<T> {
        return await this.db.findByID<T>(this.threadId!, this.collectionName, id);
    }

    public async findAll(): Promise<T[]> {
       return await this.db.find(this.threadId!, this.collectionName, {});
    }

    public async find(query: any): Promise<T[]> {
        return await this.db.find(this.threadId!, this.collectionName, query);
     }

    public async createOrUpdate(obj: T) {
        if (obj._id && obj._id !== '') {
            return await this.updateAll(obj);
        } else {
            return await this.createAll(obj);
        }
    }

    public async createAll(...object: T[]) {
        const ids = await this.db.create(this.threadId!, this.collectionName, [
              ...object
        ]);
        return ids;
    }
      
    public async updateAll(...object: T[]) { 
        await this.db.save(this.threadId!, this.collectionName, [
            ... object
        ]);
        return object.map( o => o._id);
    }
      
    public async delete(id: string) {
        await this.db.delete(this.threadId!, this.collectionName, [
            id
        ]);
    }

    public listen(actionTypes: string[], callback: (changedObj?: T, err?: any) => void) {
        const filters = [{actionTypes: actionTypes, collectionName: this.collectionName}]
        const closer = this.db.listen<T>(this.threadId!, filters, (reply?: Update<any>, err?: any) => {
            if (err) callback(undefined, err);
            if (reply && reply.instance) callback(reply.instance, err);
        });
        return closer
    }
}