~(function () {
  class Banner {
    constructor(selector, options = {}) {
      this.initParams(options);
      //   console.log(selector);
      //处理操作的容器
      if (!selector)
        throw new ReferenceError("The first selector parameter must be passed");
      if (typeof selector === "string") {
        this.container = document.querySelector(selector);
      } else {
        this.container = selector;
      }
      this.wrapper = this.container.querySelector(".wrapper");
      this.slideList = this.wrapper.querySelectorAll(".slide");
      this.timer = null;
      this.count = this.slideList.length;
      this.initialSlide =
        this.initialSlide > this.count ? this.count - 1 : this.initialSlide;
      this.activeIndex = this.initialSlide;

      //初始化显示
      [].forEach.call(this.slideList, (item, index) => {
        if (index === this.initialSlide) {
          item.style.zIndex = 1;
          item.style.opacity = 1;
          return;
        }
        item.style.zIndex = 0;
        item.style.opacity = 0;
      });
      //处理自动轮播
      if (this.autoplay) {
        let anonymous = this.autoMove.bind(this);
        this.timer = setInterval(anonymous, this.autoplay);
        this.container.addEventListener("mouseenter", () =>
          clearInterval(this.timer)
        );
        this.container.addEventListener("mouseleave", () => {
          this.timer = setInterval(anonymous, this.autoplay);
        });
      }

      //分页器处理
      if (this.pagination && this.pagination.el) {
        this.handlePagination();
      }
      //左右按钮处理
      if (this.navigation) {
        this.handleBtn();
      }
      console.log(this);
      //初始化钩子函数
      this.on && this.on.init && this.on.init.call(this, this);
    }
    //初始化参数
    initParams(options) {
      //1.默认参数信息
      let _default = {
        initialSlide: 0, //初始化显示页
        speed: 300, //速度
        autoplay: 3000, //自动轮播时间
        pagination: {
          //分页器
          el: ".pagination",
          triggerEvent: "click",
        },
        navigation: {
          //左右切换
          nextEl: ".button-next",
          prevEl: ".button-prev",
          hide: true,
        },
        on: {
          //钩子函数
          init: function (examp) {},
          transitionStart: function (examp) {},
          transitionEnd: function (examp) {},
        },
      };
      //2.替换默认信息
      for (let key in options) {
        if (!options.hasOwnProperty(key)) break;
        if (/^(pagination|navigation|on)$/i.test(key)) continue;
        _default[key] = options[key];
      }
      Banner.initItem({
        _default,
        curKey: "pagination",
        item: options.pagination,
      });
      Banner.initItem({
        _default,
        curKey: "navigation",
        item: options.navigation,
      });
      Banner.initItem({ _default, curKey: "on", item: options.on });

      //3.把处理好的信息挂载到实例中
      for (let key in _default) {
        if (!_default.hasOwnProperty(key)) break;
        this[key] = _default[key];
      }
    }
    //自动轮播
    autoMove() {
      this.activeIndex++;
      this.activeIndex >= this.count ? (this.activeIndex = 0) : null;
      this.change();
    }
    //轮播图切换
    change() {
      //动画开始前的钩子函数
      this.on &&
        this.on.transitionStart &&
        this.on.transitionStart.call(this, this);
      [].forEach.call(this.slideList, (item, index) => {
        if (index === this.activeIndex) {
          item.style.transition = `opacity ${this.speed}ms`;
          item.style.zIndex = 1;
          return;
        }
        item.style.transition = `opacity 0ms`;
        item.style.zIndex = 1;
      });
      let active = this.slideList[this.activeIndex];
      if (active) {
        active.style.opacity = 1;
        active.addEventListener("transitionend", () => {
          [].forEach.call(this.slideList, (item, index) => {
            if (index !== this.activeIndex) {
              item.style.opacity = 0;
            }
          });

          //动画结束钩子函数
          this.on &&
            this.on.transitionEnd &&
            this.on.transitionEnd.call(this, this);
        });
      }
      //焦点对齐
      if (this.paginationList) {
        [].forEach.call(this.paginationList, (item, index) => {
          if (index === this.activeIndex) {
            item.className = "active";
            return;
          }
          item.className = "";
        });
      }
    }

    //分页器
    handlePagination() {
      this.paginationBox = this.container.querySelector(this.pagination.el);
      let str = ``;
      new Array(this.count).fill("").forEach((item, index) => {
        str += `
            <span class="${index === this.activeIndex ? "active" : ""}"></span> 
            `;
      });
      this.paginationBox.innerHTML = str;
      this.paginationList = this.paginationBox.querySelectorAll("span");
      //焦点操作
      if (this.pagination.triggerEvent) {
        [].forEach.call(this.paginationList, (item, index) => {
          item.addEventListener(
            this.pagination.triggerEvent,
            Banner.throttle(() => {
              this.activeIndex = index;
              this.change();
            }, 500)
          );
        });
      }
    }

    //左右按钮
    handleBtn() {
      console.log(this.navigation);
      if (this.navigation) {
        this.prevEl = this.container.querySelector(this.navigation.prevEl);
        this.nextEl = this.container.querySelector(this.navigation.nextEl);
        if (this.prevEl || this.nextEl) {
          this.prevEl.addEventListener(
            "click",
            Banner.throttle(() => {
              this.activeIndex--;
              this.activeIndex < 0 ? (this.activeIndex = this.count - 1) : null;
              this.change();
            })
          );
          this.nextEl.addEventListener(
            "click",
            Banner.throttle(this.autoMove.bind(this), 500)
          );

          //显示隐藏的处理
          if (this.navigation.hide) {
            this.prevEl.style.display = "none";
            this.nextEl.style.display = "none";
            this.container.addEventListener("mouseenter", () => {
              this.prevEl.style.display = "block";
              this.nextEl.style.display = "block";
            });
            this.container.addEventListener("mouseleave", () => {
              this.prevEl.style.display = "none";
              this.nextEl.style.display = "none";
            });
          }
        }
      }
    }

    //初始化数据
    static initItem(args) {
      if (!args) return;
      let { _default, curKey, item } = args;
      if (item !== null) {
        item = item || {};
        for (let key in item) {
          if (!item.hasOwnProperty(key)) break;
          _default[curKey][key] = item[key];
        }
      } else {
        _default[curKey] = null;
      }
    }
    //函数节流
    static throttle(fn, wait) {
      let timer = null,
        result = null,
        prev = 0;
      return function anonymous(...args) {
        let context = this,
          now = new Date(),
          remaining = wait - (now - prev);
        if (remaining <= 0) {
          result = fn.call(context, ...args);
          clearTimeout(timer);
          timer = null;
          prev = now;
        } else if (!timer) {
          timer = setTimeout(() => {
            result = fn.call(context, ...args);
            timer = null;
            prev = new Date();
          }, remaining);
        }
        return result;
      };
    }
  }
  window.Banner = Banner;
})();
