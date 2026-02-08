import { FilterQuery, Query } from "mongoose";
import { excludeField } from "./Constant";


export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public readonly query: Record<string, string>  // { sort: 'price', page: '2' }

  // searchTerm=beach&sort=price&limit=5&page=2&fields=name,price

  constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  // 🔍 Search
  search(searchableField: string[]): this {
    const searchTerm = this.query.searchTerm?.trim();
    console.log("searchTerm", searchTerm);
    if (searchTerm) {
      const searchQuery: FilterQuery<T> = {
        $or: searchableField.map((field) => ({
          [field]: { $regex: searchTerm, $options: "i" },
        })) as FilterQuery<T>[],
      };

      this.modelQuery = this.modelQuery.find(searchQuery);
    }

    return this;
  }

  // 🧩 Filter
  filter(): this {
    const filter = { ...this.query };
    console.log("filter before cleanup:", filter);

    // excludeField গুলো remove করুন
    for (const field of excludeField) {
      delete filter[field];
    }

    console.log("filter after cleanup:", filter);

    // শুধু যদি filter object এ কিছু থাকে তাহলেই apply করুন
    if (Object.keys(filter).length > 0) {
      this.modelQuery = this.modelQuery.find(filter as FilterQuery<T>);
    }

    return this;
  }
  limit(): this {
    const limit = this.query.limit;
    this.modelQuery = this.modelQuery.limit(Number(limit));
    return this;
  }

  // 📅 Date Range (weekly, monthly, yearly)
  dateRange(): this {
    const now = new Date();
    const range = this.query.dateRange;

    if (range) {
      let startDate: Date | null = null;

      if (range === "weekly") {
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
      } else if (range === "monthly") {
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
      } else if (range === "yearly") {
        startDate = new Date();
        startDate.setFullYear(now.getFullYear() - 1);
      }

      if (startDate) {
        const dateCondition = { createdAt: { $gte: startDate, $lte: now } };

        this.modelQuery = this.modelQuery.find({
          ...((this.modelQuery as any)._conditions || {}),
          ...dateCondition,
        } as FilterQuery<T>);
      }
    }

    return this;
  }

  // 🔃 Sort
  sort(): this {
    const sort = this.query.sort || "-createdAt";
    this.modelQuery = this.modelQuery.sort(sort);
    return this;
  }

  // 📋 Fields selection
  fields(): this {
    const fields = this.query.fields?.split(",").join(" ") || "";
    if (fields) this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  // 📄 Pagination
  paginate(): this {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  // 🚀 Execute final query
  async build() {
    return await this.modelQuery.exec();
  }

  // 📊 Meta info (for pagination)
  async getMeta() {
    const totalDocuments = await this.modelQuery.clone().countDocuments();
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const totalPage = Math.ceil(totalDocuments / limit);

    return { page, limit, total: totalDocuments, totalPage };
  }
}