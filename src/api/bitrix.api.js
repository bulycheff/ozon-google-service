const axios = require('axios');
require('dotenv').config();

class BitrixApi {
  uri;
  
  constructor() {
    this.uri = process.env.B24_URI;
  }
  
}

class BitrixTasks extends BitrixApi {
  constructor() {
    super();
  }
  
  async create(fields) {
    const { data: { result: taskId } } = await axios.post(`${this.uri}/task.item.add.json`, { fields });
    return taskId;
  }
  
  async get(id) {
    const { data: { result: { task } } } = await axios.post(`${this.uri}/tasks.task.get.json`, { taskId: id });
    return task;
  }
  
  async findByTitle(...titles) {
    const titleArray = titles
      .filter((item) => item !== undefined)
      .map((item) => '%' + item.split(' ').join('%') + '%');
    console.log(titleArray.length);
    const options = {
      filter: {
        TITLE: titleArray,
      },
      select: [
        'ID', 'TITLE', 'STATUS',
      ],
      start: 1,
    };
    const result = [];
    let next = true;
    while (next) {
      const { data } = await axios.post(`${this.uri}/tasks.task.list.json`, options);
      result.push(...data.result.tasks);
      next = data.next;
      if (next) options.start += 50;
    }
    
    return result;
  }
  
}

module.exports = { BitrixTasks };
