import React, { useState, useEffect, useImperativeHandle } from 'react';
import { Input, message } from 'antd';
import './overview-table.less';
import { DeleteOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';

const Robot = (props, ref) => {
  //移动小节
  const moveSection = (index, childIndex, type) => {
    let newTableData = JSON.parse(JSON.stringify(props.data));
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
    props.setOutlineData(newTableData);
  };
  //删除小节
  const deleteSection = (index, childIndex) => {
    let newTableData = JSON.parse(JSON.stringify(props.data));
    newTableData[index].children.splice(childIndex, 1);
    props.setOutlineData(newTableData);
  };
  //添加小节
  const addSection = (index) => {
    let newTableData = JSON.parse(JSON.stringify(props.data));
    newTableData[index].children.push('');
    props.setOutlineData(newTableData);
  };
  //修改小节内容
  const changeSection = (index, childIndex, value) => {
    let newTableData = JSON.parse(JSON.stringify(props.data));
    newTableData[index].children[childIndex] = value;
    props.setOutlineData(newTableData);
  };
  //修改大纲标题
  const changeTitle = (index, value) => {
    let newTableData = JSON.parse(JSON.stringify(props.data));
    newTableData[index].title = value;
    props.setOutlineData(newTableData);
  };

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
          {props.data.map((item, index) => {
            return (
              <div key={index} className="content-section">
                <div className="content-title">
                  <Input
                    value={item.title}
                    style={{ width: '60%' }}
                    onChange={(e) => changeTitle(index, e.target.value)}
                  />
                </div>
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
                          <Input
                            value={child}
                            onChange={(e) => {
                              changeSection(index, childIndex, e.target.value);
                            }}
                          />
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
