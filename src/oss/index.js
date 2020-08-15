/**
 * OSS图片处理工具类
 *
 * @module OSSImageUrl
 */

// 用a拼接obj里面的每对kv，并用b分割
const joinStr = function (obj, a, b) {
  return Object.keys(obj)
    .reduce((acc, cur) => {
      if (obj[cur]) return (acc += `${b}${cur}${a}${obj[cur]}`);
      return (acc += `${b}${cur}`);
    }, "")
    .slice(1);
};

// 驼峰转中横线
const decamelize = (str) => str.replace(/\B([A-Z])/g, "-$1").toLowerCase();

const throwNoKeyError = (error) => {
  throw new Error(error);
};

const methods = "resize,blur,circle,crop,indexcrop,rotate,bright,contrast,sharpen,format,watermark,interlace,quality,roundedCorners,autoOrient".split(
  ","
);

/**
 * OSS图片处理
 *
 * @class
 * @param {*} originUrl 原始OSS图片链接
 */
function TzOssImage(originUrl) {
  this.originUrl = originUrl;
  this.methodKeys = {};
  methods.forEach((method) => {
    TzOssImage.prototype[method] = function (
      key = throwNoKeyError(`方法：${method}，需要至少一个参数`),
      value
    ) {
      if (typeof key === "object") {
        this.methodKeys[method] = key;
      } else {
        if (!this.methodKeys[method]) this.methodKeys[method] = {};
        this.methodKeys[method][key] = value;
      }
      return this;
    };
  });
}

Object.defineProperty(TzOssImage.prototype, "url", {
  get() {
    const url = new URL(this.originUrl);
    const formatParams = Object.keys(this.methodKeys).reduce((acc, method) => {
      const str = joinStr(this.methodKeys[method], "_", ",");
      if (!str) return acc;
      return (acc += `/${decamelize(method)},${str}`);
    }, "");
    url.searchParams.set("x-oss-process", `image${formatParams}`);
    return url.href;
  },
});

/**
 * 对原始的oss 图片链接进行处理，如压缩，尺寸等。
 * 可以通过链式调用一下方法 resize,blur,circle,crop,indexcrop,rotate,bright,contrast,sharpen,format,watermark,interlace,quality,roundedCorners,autoOrient。
 * 最后通过 .url 获取处理后的链接
 *
 * @export
 * @param {*} url 原始的图片oss url
 * @return {Promise}
 * @example
 * const compressImage = tzOssImage(url)
    .resize({ w: 160, h: 90 })
    .quality(80).url
 * 
 */
function tzOssImage(url) {
  return new TzOssImage(url);
}

export default tzOssImage;
