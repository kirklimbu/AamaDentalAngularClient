import { ItemList } from "./item-list.model";

export class VisitDetail {
  id?: number;
  customerId?: number;
  visitMainId: number;
  amount?: number;
  visitAfterDay: number;
  doctor: string;
  nextVisitDateBs?: string;
  visitDateBs: string;
  today: boolean;
  itemList: ItemList[];

  constructor() {
    this.itemList = [];
  }
}