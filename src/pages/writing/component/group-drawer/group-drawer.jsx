import React, { useState, useImperativeHandle, forwardRef } from 'react';
import {
  Drawer,
  List,
  Row,
  Col,
  Upload,
  Checkbox,
  Space,
  Spin,
  Button,
  message,
  Modal,
} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import mammoth from 'mammoth';
import styles from './drawer.module.less';
import { cloneDeep, findIndex } from 'lodash';
import {
  DownOutlined,
  UpOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

const { Dragger } = Upload;
const config = {
  name: 'file',
  multiple: false,
  maxCount: 5,
  showUploadList: false,
};

const GroupDrawer = forwardRef((props, ref) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  //上传文件list
  const [uploadList, setUploadList] = useState([]);
  //新文章目录
  const [newArticle, setNewArticle] = useState([]);

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    // clearAll();
    setOpen(false);
  };
  //清空所有数据
  // const clearAll = () => {
  //   setUploadList([]);
  //   setNewArticle([]);
  // };
  const confirm = () => {
    //如果props中有数据则提示是否清空
  };

  //传入文件解析后的html数据
  const sumUp = () => {
    let newHtml = '';
    newArticle.forEach((item) => {
      newHtml += item.content;
    });
    console.log('props.html', props.html);
    Modal.confirm({
      title: '此操作会刷新编辑器内容，是否继续？',
      icon: <ExclamationCircleOutlined />,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        props.setHtml(newHtml);
        onClose();
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  //文件选择事件
  const fileChange = async (info) => {
    if (info.file.status === 'error') {
      //如果文件超过5个则禁止上传
      if (uploadList.length >= 5) {
        message.error('最多上传5个文件');
        return;
      }
      //只能上传doc与docx文件
      if (
        info.file.type !==
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
        info.file.type !== 'application/msword'
      ) {
        message.error('只能上传doc与docx文件');
        return;
      }
      setLoading(true);
      const value = await analysisWord(info.file.originFileObj); //解析word
      getHtmlTree(value);
    }
  };
  function findHtmlTagIndex(n, str) {
    // 正则表达式匹配 hx 标签，其中 x 是从 1 到 n 的任意数字
    const regex = new RegExp(`<h([1-${n}])[^>]*>`, 'i');
    const match = str.match(regex);

    if (match) {
      // 返回匹配到的标签在字符串中的起始位置
      return match.index;
    }
    // 没有匹配到符合条件的标签，返回 -1
    return -1;
  }

  function extractTitleAndContent(htmlString) {
    // 使用正则表达式匹配<h1>到<h6>标签及其内容
    const regex = /(<h[1-6]>.*?<\/h[1-6]>)([\s\S]*?)(?=<h[1-6]>|$)/g;
    let matches;
    let result = [];

    // 提取所有标题和内容
    while ((matches = regex.exec(htmlString)) !== null) {
      result.push({
        title: matches[1],
        level: matches[1].match(/<h([1-6])>/)[1],
      });
    }

    return result;
  }
  function arrayToTree(data) {
    // 初始化一个栈和一个根节点
    const stack = [];
    const root = { title: 'root', children: [] };
    stack.push({ level: 0, node: root });

    data.forEach((item) => {
      // 创建当前节点
      const newNode = {
        title: item.title,
        content: item.content,
        children: [],
      };

      // 找到栈中比当前节点级别低的节点
      while (stack.length && stack[stack.length - 1].level >= item.level) {
        stack.pop();
      }

      // 将当前节点添加到栈顶节点的子节点中
      stack[stack.length - 1].node.children.push(newNode);

      // 将当前节点入栈
      stack.push({ level: item.level, node: newNode });
    });

    return root.children;
  }

  //获取str中h1 h2 h3标签  json树级结构
  const getHtmlTree = (htmlString) => {
    // console.log('htmlString', htmlString);
    const result = extractTitleAndContent(htmlString);
    // console.log(result);
    //遍历result数组正则出item.title在htmlString中的位置作为item的start,正则出下一个item.tag在htmlString中的位置作为item的end
    //开始编写
    for (let i = 0; i < result.length; i++) {
      let item = result[i];
      let start = htmlString.indexOf(item.title) + item.title.length;
      let arr = htmlString.split(item.title);
      let end = findHtmlTagIndex(item.level, arr[1]);
      let content;
      if (end > -1) {
        content = htmlString.substring(start, start + end);
      } else {
        content = htmlString.substring(start, htmlString.length);
      }
      item.content = content;
    }
    // let tree = arrayToTree(result);
    // console.log(tree);

    let arr = [...uploadList];
    arr.push(result);
    setUploadList(arr);
    setLoading(false);
    //console.log(result);
  };
  //选中文章块标记状态复制到新文章目录
  const selectArticle = (page, pageIndex, listItem, index) => {
    let copyList = cloneDeep(uploadList);
    //如果已经选中则删除选中状态,删除新文章目录中的文章
    if (listItem.checked) {
      copyList[pageIndex][index].checked = false;
      setUploadList(copyList);
      let arr = [...newArticle];
      let newIndex = findIndex(arr, { pageIndex, positionIndex: index });
      arr.splice(newIndex, 1);
      setNewArticle(arr);
      return;
    }
    //如果未选中则添加选中状态,添加新文章目录中的文章
    copyList[pageIndex][index].checked = true;
    setUploadList(copyList);
    let arr = [...newArticle];
    let obj = {
      title: listItem.title,
      content: listItem.content,
      pageIndex: pageIndex,
      positionIndex: index,
      checked: true,
    };
    arr.push(obj);
    setNewArticle(arr);
  };
  //新文章目录中取消选中
  const newListCheck = (item, index) => {
    let copyList = cloneDeep(uploadList);
    copyList[item.pageIndex][item.positionIndex].checked = false;
    setUploadList(copyList);
    let arr = [...newArticle];
    arr.splice(index, 1);
    setNewArticle(arr);
  };

  //解析word
  const analysisWord = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function (evt) {
        //当文件读取完毕后
        mammoth //调用mammoth组件的方法进行解析文件
          .convertToHtml({ arrayBuffer: evt.target.result })
          .then(function (resultObject) {
            resolve(resultObject.value); //将处理好的html数据返回
          });
      };
      reader.readAsArrayBuffer(file); // 启动读取指定的 Blob 或 File 内容 ：https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader/readAsArrayBuffer
    });
  };
  //上移
  const upAction = (index) => {
    let arr = [...newArticle];
    if (index === 0) {
      return;
    }
    let temp = arr[index];
    arr[index] = arr[index - 1];
    arr[index - 1] = temp;
    setNewArticle(arr);
  };
  //下移
  const downAction = (index) => {
    let arr = [...newArticle];
    if (index === arr.length - 1) {
      return;
    }
    let temp = arr[index];
    arr[index] = arr[index + 1];
    arr[index + 1] = temp;
    setNewArticle(arr);
  };
  //抛出函数
  useImperativeHandle(ref, () => ({
    showDrawer: showDrawer,
  }));
  //删除文件
  const deleteFile = (page, index) => {
    //如果page没有被选中则直接删除
    let delState = page.every((item) => {
      return !item.checked;
    });
    if (delState) {
      let arr = [...uploadList];
      arr.splice(index, 1);
      setUploadList(arr);
      return;
    }
    message.error('请先取消选中');
  };
  return (
    <>
      <Drawer
        getContainer={false}
        title="片段合成"
        width="95%"
        onClose={onClose}
        open={open}
      >
        <div className={styles['group-drawer']}>
          <Row style={{ width: '100%' }} gutter={24} justify="space-between">
            <Col span={18}>
              <Spin tip="文章解析中..." spinning={loading} size="large">
                <div className={styles['pre-view']}>
                  <div
                    style={{ minWidth: `${(uploadList.length + 1) * 40}%` }}
                    className={styles['pre-view-scroll']}
                  >
                    {uploadList.map((page, pageIndex) => {
                      return (
                        <div key={pageIndex} className={styles['file-body']}>
                          <div className={styles['delete-file']}>
                            <Button
                              danger
                              size="small"
                              onClick={() => {
                                deleteFile(page, pageIndex);
                              }}
                            >
                              删除
                            </Button>
                          </div>
                          <div className={styles['file-body-scroll']}>
                            {page.map((item, index) => {
                              return (
                                <div
                                  key={index}
                                  className={styles['file-item']}
                                >
                                  <Checkbox
                                    onClick={() =>
                                      selectArticle(
                                        page,
                                        pageIndex,
                                        item,
                                        index
                                      )
                                    }
                                  >
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: item.title,
                                      }}
                                    ></div>
                                  </Checkbox>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    <div className={styles['upload']}>
                      <Dragger {...config} onChange={fileChange}>
                        <p style={{ flex: 1 }} className="ant-upload-drag-icon">
                          <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">
                          单击或拖动文件到此区域进行上传
                        </p>
                        <p className="ant-upload-hint">
                          支持上传doc,docx等文件格式。
                        </p>
                      </Dragger>
                    </div>
                  </div>
                </div>
              </Spin>
            </Col>
            <Col span={6}>
              <div className={styles['result']}>
                <List
                  header={
                    <div className={styles['result-header']}>
                      <b>结果目录</b>
                      <Button
                        type="primary"
                        onClick={() => {
                          sumUp();
                        }}
                      >
                        合成
                      </Button>
                    </div>
                  }
                  bordered
                  style={{ height: 'calc(100vh - 100px)' }}
                  dataSource={newArticle}
                  renderItem={(item, index) => (
                    <List.Item>
                      <Row
                        gutter={8}
                        style={{ width: '100%' }}
                        justify="space-between"
                      >
                        <Col span={2}>
                          <Checkbox
                            defaultChecked={item.checked}
                            onChange={() => {
                              newListCheck(item, index);
                            }}
                          ></Checkbox>
                        </Col>
                        <Col span={18}>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: item.title,
                            }}
                          ></div>
                        </Col>
                        <Col span={4}>
                          <Space className={styles['result-tools']}>
                            <a
                              onClick={() => {
                                upAction(index);
                              }}
                            >
                              <UpOutlined />
                            </a>
                            <a
                              onClick={() => {
                                downAction(index);
                              }}
                            >
                              <DownOutlined />
                            </a>
                          </Space>
                        </Col>
                      </Row>
                    </List.Item>
                  )}
                />
              </div>
            </Col>
          </Row>
        </div>
      </Drawer>
    </>
  );
});
export default GroupDrawer;
