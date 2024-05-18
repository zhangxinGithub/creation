import React, { useState, useEffect, useImperativeHandle } from 'react';
import { Input } from 'antd';
import './overview-table.less';
import { DeleteOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';

const Robot = (props, ref) => {
  //表格数据
  const [tableData, setTableData] = useState([
    {
      title: '一、工作开展情况与成果',
      children: [
        '校园暴力预防与处理',
        '食品安全监管与改进',
        '网络沉迷干预与教育',
      ],
    },
    {
      title: '二、存在问题与反思',
      children: [
        '校园暴力问题的根源与解决策略',
        '食品安全问题的挑战与应对措施',
        '网络沉迷问题的现状与改进方向',
      ],
    },
  ]);
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
                <div className="content-title">一、工作开展情况与成果</div>
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
                            style={{ color: '#165dff', cursor: 'pointer' }}
                          />
                        </div>
                        <div style={{ width: '100px', textAlign: 'center' }}>
                          <UpOutlined
                            style={{ marginRight: '8px', cursor: 'pointer' }}
                          />
                          <DownOutlined style={{ cursor: 'pointer' }} />
                        </div>
                      </div>
                    );
                  })}
                  <div className="add-item">+添加</div>
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
