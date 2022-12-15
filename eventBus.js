
class EventBus {
  constructor() {
    this.eventObj = {};
  }

  // 添加事件
  add(eventName, callback) {
    // 初始化事件
    if (!this.eventObj[eventName]) {
      this.eventObj[eventName] = [];
    }
    this.eventObj[eventName].push(callback);
  }

  // 触发事件
  dispatch(eventName, ...argValue) {
    if (this.eventObj[eventName]) {
      this.eventObj[eventName].forEach(funcItem => {
        funcItem(...argValue);
      });
    } else {
      console.warn('没有', eventName, '这个事件');
    }
  }
}

export default EventBus;
