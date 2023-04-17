class GroupOrder {
  async groupByOrder(array, key) {
    try {
      return array.reduce((result, obj) => {
        (result[obj[key]] = result[obj[key]] || []).push(obj);
        return result;
      }, {});
    } catch (error) {
      console.log(error);
    }
  }
}

export default GroupOrder;
