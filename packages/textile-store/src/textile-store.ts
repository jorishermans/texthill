declare var localStorage: any;
import { Store } from '@texthill/core';
import { Where } from '@textile/hub';
import { Model, Repository } from 'textile-repository';

export interface ISearch extends Model {
    name: string;
    blob: any;
}

export class TextileStore implements Store {
    
    constructor(private repo: Repository<ISearch>) {}

    async getItem(key: string, defaultValue?: any) {
        const q = new Where('name').eq(key);
        const data: ISearch[] = await this.repo.find(q);
        return data.length > 0 ? data[0].blob : defaultValue;
    }
    async setItem(key: string, data: any) {
        const q = new Where('name').eq(key);
        const oData: ISearch[] = await this.repo.find(q);
        const savingData = oData.length === 0 ? { _id: '', name: key, blob: data } : oData[0];
        savingData.blob = data;
        await this.repo.createOrUpdate(savingData);
    }
    async removeItem(key: string) {
        const oData: ISearch[] = await this.repo.find({name: key});
        if (oData.length > 0) {
            const id = oData[0]._id;
            this.repo.delete(id);
        }
    }

}