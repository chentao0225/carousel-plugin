let $container1 = $("#container1");
let $container2 = $("#container2");
$.ajax({
  url: "../json/bannerData1.json",
  method: "get",
  success: (res) => {
    // console.log(res);
    let str1 = ``;
    res.forEach((item) => {
      str1 += `
      <div class="slide"><img src="${item.pic}"/></div>
      `;
    });
    $container1.find(".wrapper").html(str1);

    new Banner("#container1", {
      autoplay: 1500,
      navigation: null,
      on: {
        init() {
          console.log("初始化成功");
        },
        transitionStart() {
          console.log("动画开始了");
        },
        transitionEnd() {
          console.log("动画结束");
        },
      },
    });
  },
});
$.ajax({
  url: "../json/bannerData2.json",
  method: "get",
  success: (res) => {
    // console.log(res);
    let str1 = ``;
    res.forEach((item) => {
      str1 += `
      <div class="slide"><img src="${item.pic}"/></div>
      `;
    });
    $container2.find(".wrapper").html(str1);

    new Banner("#container2", {
      initialSlide: 4,
      autoplay: null,
      pagination: {
        triggerEvent: "mouseenter",
      },
      navigation: {
        nextEl: ".next",
        prevEl: ".prev",
      },
    });
  },
});
