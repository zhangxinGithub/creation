import React, { useState, useEffect, useImperativeHandle } from 'react';
import { Input, message } from 'antd';
import './overview-table.less';
import { DeleteOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';

const Robot = (props, ref) => {
  //表格数据
  const [tableData, setTableData] = useState([]);
  //移动小节
  const moveSection = (index, childIndex, type) => {
    let newTableData = JSON.parse(JSON.stringify(tableData));
    let currentSection = newTableData[index].children[childIndex];
    if (type === 'up' && childIndex === 0) {
      return;
    }
    if (
      type === 'down' &&
      childIndex === newTableData[index].children.length - 1
    ) {
      return;
    }
    let targetIndex = type === 'up' ? childIndex - 1 : childIndex + 1;
    newTableData[index].children[childIndex] =
      newTableData[index].children[targetIndex];
    newTableData[index].children[targetIndex] = currentSection;
    setTableData(newTableData);
  };
  //删除小节
  const deleteSection = (index, childIndex) => {
    let newTableData = JSON.parse(JSON.stringify(tableData));
    newTableData[index].children.splice(childIndex, 1);
    setTableData(newTableData);
  };
  //添加小节
  const addSection = (index) => {
    let newTableData = JSON.parse(JSON.stringify(tableData));
    newTableData[index].children.push('');
    setTableData(newTableData);
  };
  useEffect(() => {
    let jsonStr = '';
    //如果没有正则出json```则跳过后面方法
    if (!props.data.match(/```json/)) {
      jsonStr = props.data;
    } else {
      //正则出json```主题内容```格式的数据
      let reg = /```([\s\S]*?)```/g;
      let json = props.data.match(reg);
      //删除'json```'和'```'字符
      jsonStr = json[0].replace(/```json/g, '').replace(/```/g, '');
      //删除开头的换行符
      jsonStr = jsonStr.replace(/^\n/, '');
      //将json字符串转换为json对象
    }
    let jsonObj = {};
    try {
      jsonObj = JSON.parse(jsonStr);
    } catch (e) {
      message.error('json格式错误');
      console.log(e);
    }
    //title是大纲的标题,sub是大纲的小节,subTitle是小节的标题,jsonObj
    let tableData = [];
    jsonObj.sub.map((item) => {
      let title = item.subTitle;
      let children = [];
      item.subSub.map((subItem) => {
        children.push(subItem);
      });
      tableData.push({ title, children });
    });
    setTableData(tableData);
  }, [props.data]);

  return (
    <div className="overview-table">
      <div className="table-header">
        <div style={{ width: '70px', textAlign: 'center' }}>序号</div>
        <div style={{ flex: '1' }}>大纲</div>
        <div style={{ width: '50px', textAlign: 'center' }}>删除</div>
        <div style={{ width: '100px', textAlign: 'center' }}>移动</div>
      </div>
      <div className="content">
        <div className="content-scroll">
          {tableData.map((item, index) => {
            return (
              <div key={index} className="content-section">
                <div className="content-title">{item.title}</div>
                <div className="content-list">
                  {item.children.map((child, childIndex) => {
                    return (
                      <div
                        className="content-item"
                        key={`${index}-${childIndex}`}
                      >
                        <div
                          style={{
                            width: '70px',
                            textAlign: 'center',
                            display: 'flex',
                            justifyContent: 'end',
                            itemAlign: 'center',
                          }}
                        >
                          <div className="num">{childIndex + 1}</div>
                        </div>
                        <div style={{ flex: '1' }}>
                          <Input value={child} />
                        </div>
                        <div style={{ width: '50px', textAlign: 'center' }}>
                          <DeleteOutlined
                            onClick={() => deleteSection(index, childIndex)}
                            style={{ color: '#165dff', cursor: 'pointer' }}
                          />
                        </div>
                        <div style={{ width: '100px', textAlign: 'center' }}>
                          <UpOutlined
                            onClick={() => moveSection(index, childIndex, 'up')}
                            style={{ marginRight: '8px', cursor: 'pointer' }}
                          />
                          <DownOutlined
                            onClick={() =>
                              moveSection(index, childIndex, 'down')
                            }
                            style={{ cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div
                    className="add-item"
                    onClick={() => addSection(index)}
                    style={{ cursor: 'pointer' }}
                  >
                    +添加
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Robot;
