import React, { Component } from 'react';
import { connect } from 'dva';
import { WhiteSpace, ImagePicker, Toast } from 'antd-mobile';
import { uploadUserImg, updateQyImg } from 'services/enterprise';
import { compress } from 'utils/utils';
import styles from './upload.less';

@connect()
class Upload extends Component {
  state = {
    filesList: [],
  };

  onChange = (files, types, index) => {
    const {
      location: { query },
    } = this.props;
    const { userId, djxh } = query;
    if (index === undefined) {
      // 图片最大为5M
      if (files[0].file.size > 5242880) {
        Toast.info('图片大小不能超过5M！', 1);
        return;
      }
      this.setState({
        filesList: files,
      });
      const file = files[0];
      const { file: { type } } = file;
      const Img = new Image();
      Img.src = file.url;
      Img.onload = () => {
        const url = compress(Img);
        // 需要计算文件流大小，首先把头部的data:image/jpeg;base64,（注意有逗号）去掉。
        const str = url.substring(23);
        // 删除末尾的等号 =
        // const equalIndex= str.indexOf('=');
        // if(equalIndex > 0) {
        //     str=str.substring(0, equalIndex);
        // }
        // 将base64转化为二进制对象
        const text = window.atob(str);
        const buffer = new ArrayBuffer(text.length);
        const ubuffer = new Uint8Array(buffer);
        for (let i = 0; i < text.length; i+=1) {
            ubuffer[i] = text.charCodeAt(i);
        }

        const Builder = window.WebKitBlobBuilder || window.MozBlobBuilder;
        let blob;

        if (Builder) {
            const builder = new Builder();
            builder.append(buffer);
            blob = builder.getBlob(type);
        } else {
            blob = new window.Blob([buffer], {type});
        }
        Toast.loading('图片上传中');
        const formData = new FormData();
        formData.append('file', blob, 'photo.jpeg');
        uploadUserImg({ params: formData }).then(res => {
          Toast.hide();
          if (!res) {
            Toast.fail('上传失败！', 1);
            return;
          }
          if (res.code !== 0) return;
          const photoUrl = res.data;
          Toast.success('上传成功', 1);
          
          const params = {
            userId,
            photo: photoUrl,
            djxh
          };
          // eslint-disable-next-line
          return updateQyImg({ params })
        }).then(res => {

          if (!res) {
            Toast.fail('图片更新失败！');
            return;
          }
          if (res.code === 0) {
            router.push(`/user/EnterpriseInformation?userId=${userId}&djxh=${djxh}`);
          }
        })
        .catch(e => {
          Toast.fail(e.message);
        });
      }
      // lrz(files[0].url, { quality: 0.1 })
      //   .then(res => {
      //     const { file, formData } = res;
      //     formData.append('file', file);
      //     Toast.loading('图片上传中');
      //     return uploadUserImg({ params: formData });
      //   })
      //   .then(res => {
      //     Toast.hide();
      //     if (!res) {
      //       Toast.fail('上传失败！');
      //       return;
      //     }
      //     if (res.code !== 0) return;
      //     const url = res.data;
      //     Toast.success('上传成功！');
      //     const params = {
      //       userId,
      //       photo: url,
      //       djxh,
      //     };
      //     // eslint-disable-next-line
      //     return updateQyImg({ params });
      //   })
      //   .then(res => {
      //     if (!res) {
      //       Toast.fail(res);
      //       return;
      //     }
      //     if (res.code === 0) {
      //       router.push(`/user/EnterpriseInformation?userId=${userId}&djxh=${djxh}`);
      //     }
      //   })
      //   .catch(e => {
      //     Toast.fail(e.message);
      //   });
    } else {
      this.setState({
        filesList: [],
      });
    }
  };

  onImageClick = (index, fs) => {
    if (fs.length === 0) {
      Toast.info('请上传图片！');
    }
  };

  render() {
    const { filesList } = this.state;
    return (
      <div className={styles.img_container}>
        <WhiteSpace size="xl" />
        <p className={styles.images}>请选择你要上传的头像</p>
        <div className={styles.uploadpicker}>
          <ImagePicker
            length={1}
            files={filesList}
            selectable={filesList.length < 1}
            onChange={this.onChange}
            onImageClick={this.onImageClick}
            multiple={false}
            className={filesList.length > 0 ? styles.showPic : ''}
          />
        </div>
        <WhiteSpace size="xl" />
      </div>
    );
  }
}
export default Upload;
