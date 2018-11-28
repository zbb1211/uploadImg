// https://www.cnblogs.com/axes/p/4603984.html
export function compress(img) {
  let { width, height} = img;
  // 如果图片大于四百万像素，计算压缩比并将大小压至400万以下
  let ratio = width * height / 4000000;
  if (ratio > 1) {
    ratio = Math.sqrt(ratio);
    width /= ratio;
    height /= ratio;
  } else {
    ratio = 1;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  let ctx;
  if (canvas.getContext) {
    ctx = canvas.getContext('2d');
  }
  // canvas的toDataURL只能转jpg的
  if (ctx) {
    // 铺底色
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // 如果图片像素大于100万则使用瓦片绘制
  let count = width * height / 1000000;
  if (count > 1) {
    count = parseInt((Math.sqrt(count) + 1), 10); // 计算要分成多少块瓦片

    // 计算每块瓦片的宽和高
    const nw = parseInt((width / count), 10);
    const nh = parseInt((height / count), 10);
    const tCanvas = document.createElement('canvas');
    tCanvas.width = nw;
    tCanvas.height = nh;
    let tctx;
    if (tCanvas.getContext) {
      tctx = tCanvas.getContext('2d');
      for (let i = 0; i < count; i+=1) {
        for (let j = 0; j < count; j+=1) {
          tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);
  
          ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
        }
      }
    }
  } else {
    ctx.drawImage(img, 0, 0, width, height);
  }

  // 进行最小压缩
  const ndata = canvas.toDataURL('image/jpeg', 0.1);

  return ndata;
}