import React, { useState, useRef, useEffect } from 'react';
import { Modal, Row, Col, Card, Input, Button, Typography, Divider, Space, message, Descriptions, Select } from 'antd';
import { DollarOutlined, CalculatorOutlined, SaveOutlined, ReloadOutlined, CloseCircleOutlined, UserOutlined, ClockCircleOutlined, PlusOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import moment from 'moment';
const { Title, Text } = Typography;
const { Option } = Select;
import { useSale } from '../../../hooks/UseSale';

const CloseShiftModal = ({ visible, onClose, onShiftClose }) => {
  const [amount, setAmount] = useState('');
  const { handleCloseShiftCreate, handleGetOneOpenShift } = useSale();
  const [loading, setLoading] = useState(false);
  const [shiftInfo, setShiftInfo] = useState(null);
  const userData = JSON.parse(Cookies.get('user') || '{}');
  const [cashEntries, setCashEntries] = useState([]);
  const [activeInput, setActiveInput] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const availableDenominations = {
    USD: [100, 50, 20, 10, 5, 1],
    KHR: [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 100]
  };

  useEffect(() => {
    if (visible) {
      fetchCurrentShift();
    }
  }, [visible]);

  const fetchCurrentShift = async () => {
    try {
      const token = localStorage.getItem('token');
      const shiftId = Cookies.get("shift_id");
      
      if (!shiftId) {
        throw new Error('No active shift found');
      }
      
      const response = await handleGetOneOpenShift(shiftId, userData.warehouse_id, token);
      console.log(response);
      
      if (response.success) {
        setShiftInfo(response.shift);
        
        if (response.shift.cash_detail && response.shift.cash_detail.length > 0) {
          setCashEntries(response.shift.cash_detail.map(item => ({
            currency: item.currency,
            money_type: item.money_type.toString(),
            money_number: item.money_number,
            id: Math.random().toString(36).substr(2, 9) 
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching shift info:', error);
      message.error('Failed to load shift information');
    }
  };

  const calculateTotals = () => {
    const totals = {
      usd: 0,
      kh: 0,
      combined: 0
    };

    cashEntries.forEach(entry => {
      const amount = parseFloat(entry.money_type) * parseFloat(entry.money_number || 0);
      if (entry.currency === 'USD') {
        totals.usd += amount;
      } else {
        totals.kh += amount;
      }
    });

    totals.combined = totals.usd + (totals.kh / 4000); 
    return totals;
  };

  const totals = calculateTotals();
  const token = localStorage.getItem('token');

  const handleKeypadInput = (value) => {
    if (!activeInput) {
      message.warning('Please select a denomination field first');
      return;
    }

    let newValue = inputValue;
    if (value === 'backspace') {
      newValue = inputValue.slice(0, -1);
    } else if (value === '.' && !inputValue.includes('.')) {
      newValue = inputValue + '.';
    } else if (value !== '.' && inputValue.length < 10) {
      newValue = inputValue === '0' ? value : inputValue + value;
    }

    if (/^(\d+\.?\d{0,2}|\.\d{1,2})?$/.test(newValue)) {
      setInputValue(newValue);
      const numericValue = newValue === '' ? 0 : parseFloat(newValue);
      
      setCashEntries(prev => prev.map(entry => 
        entry.id === activeInput 
          ? { ...entry, money_number: numericValue } 
          : entry
      ));
    }
  };

  const handleInputFocus = (entryId, currentValue, event) => {
    setActiveInput(entryId);
    setInputValue(currentValue !== 0 ? currentValue.toString() : '');
    inputRef.current = event.target;
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'KHR',
      minimumFractionDigits: currency === 'USD' ? 2 : 0,
    }).format(parseFloat(amount) || 0);
  };

  const handleClearAll = () => {
    setCashEntries([]);
    setInputValue('');
    setActiveInput(null);
    setAmount('');
  };

  const addNewCashEntry = (currency) => {
    const newEntry = {
      id: Math.random().toString(36).substr(2, 9),
      currency,
      money_type: availableDenominations[currency][0].toString(),
      money_number: 0
    };
    setCashEntries([...cashEntries, newEntry]);
  };

  const removeCashEntry = (id) => {
    setCashEntries(cashEntries.filter(entry => entry.id !== id));
  };

  const updateCashEntry = (id, field, value) => {
    setCashEntries(cashEntries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const handleCloseShiftAction = async () => {
    setLoading(true);
    try {
      const shiftId = Cookies.get("shift_id");
      
      if (!shiftId) {
        throw new Error('No active shift found');
      }
      
      const cash_detail = cashEntries.map(entry => ({
        money_number: parseFloat(entry.money_number),
        currency: entry.currency,
        money_type: parseFloat(entry.money_type),
        total: parseFloat(entry.money_type) * parseFloat(entry.money_number)
      }));
      const now = new Date();
      const localTime = now.toLocaleString(); 

      const shiftData = {
        total_usd: totals.usd,
        total_kh: totals.kh,
        end_time: localTime,
        user_id: userData.id,
        open_shift_id:shiftId,
        cash_detail,
        warehouse_id: userData.warehouse_id
      };

      // console.log(shiftData);
      // return;
      

      const response = await handleCloseShiftCreate(shiftData, token);
            
      // return;
      if (!response.success) {
        throw new Error('Failed to close shift');
      } else {
        Cookies.remove('is_open_shift');
        Cookies.remove('shift_id');
        location.reload();
      }

      message.success('Shift closed successfully');
      onShiftClose({
        shiftId: shiftId,
        ...shiftData
      });
      onClose();
    } catch (error) {
      console.error('Shift closing error:', error);
      message.error(error.message || 'Failed to close shift');
    } finally {
      setLoading(false);
    }
  };

  const renderCashEntries = () => {
    return (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {cashEntries.map((entry) => (
          <Row key={entry.id} gutter={16} align="middle">
            <Col span={6}>
              <Select
                value={entry.money_type}
                onChange={(value) => updateCashEntry(entry.id, 'money_type', value)}
                style={{ width: '100%' }}
              >
                {availableDenominations[entry.currency].map(denom => (
                  <Option key={`${entry.currency}-${denom}`} value={denom.toString()}>
                    {entry.currency === 'USD' ? '$' : '៛'}{denom}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={14}>
              <Input
                type="number"
                min={0}
                step={entry.currency === 'USD' ? '0.01' : '1'}
                value={entry.money_number}
                onChange={(e) => updateCashEntry(entry.id, 'money_number', e.target.value)}
                onFocus={(e) => handleInputFocus(entry.id, entry.money_number, e)}
                style={{ textAlign: 'right' }}
              />
            </Col>
            <Col span={4}>
              <Button 
                danger 
                onClick={() => removeCashEntry(entry.id)}
                icon={<CloseCircleOutlined />}
              />
            </Col>
          </Row>
        ))}
        
        <Row gutter={16}>
          <Col span={12}>
            <Button 
              type="dashed" 
              onClick={() => addNewCashEntry('USD')} 
              icon={<PlusOutlined />}
              block
            >
              Add USD
            </Button>
          </Col>
          <Col span={12}>
            <Button 
              type="dashed" 
              onClick={() => addNewCashEntry('KHR')} 
              icon={<PlusOutlined />}
              block
            >
              Add KHR
            </Button>
          </Col>
        </Row>
      </Space>
    );
  };

  return (
    <Modal
      title={<><DollarOutlined /> Close Current Shift</>}
      open={visible}
      onCancel={onClose}
      footer={null}
      width="80%"
      destroyOnClose
    >
      <Row gutter={24}>
        <Col span={12}>
          <Card>
            {shiftInfo && (
              <Descriptions bordered size="small" column={1} style={{ marginBottom: '16px' }}>
                <Descriptions.Item label={<><UserOutlined /> Opened By</>}>
                  {shiftInfo.data?.salesperson || 'Unknown'}
                </Descriptions.Item>
                <Descriptions.Item label={<><ClockCircleOutlined /> Start Time</>}>
                  {moment(shiftInfo.data?.opened_at).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label={<><DollarOutlined /> Initial USD</>}>
                  {(Number(shiftInfo.meta?.initial_cash?.usd) || 0).toFixed(2)}
                </Descriptions.Item>
                <Descriptions.Item label={<span>🇰🇭 Initial Riel</span>}>
                  {(Number(shiftInfo.meta?.initial_cash?.kh) || 0).toFixed(0)}
                </Descriptions.Item>
              </Descriptions>
            )}
            
            <Divider />
            
            <div>
              <Title level={5}>Cash Count</Title>
              {renderCashEntries()}
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Card title="Shift Summary">
              <Divider />
              <Row justify="space-between">
                <Col><Text strong>USD Total:</Text></Col>
                <Col><Text>{formatCurrency(totals.usd, 'USD')}</Text></Col>
              </Row>
              <Row justify="space-between">
                <Col><Text strong>Riel Total:</Text></Col>
                <Col><Text>{formatCurrency(totals.kh, 'KHR')}</Text></Col>
              </Row>
              <Divider />
              <Row justify="space-between">
                <Col><Text strong>Combined Total (USD):</Text></Col>
                <Col><Text strong>${totals.combined.toFixed(2)}</Text></Col>
              </Row>
              {shiftInfo && (
                <>
                  <Divider />
                  <Row justify="space-between">
                    <Col><Text strong>Duration:</Text></Col>
                    <Col>
                      <Text>
                        {moment.duration(moment().diff(moment(shiftInfo.data?.opened_at))).humanize()}
                      </Text>
                    </Col>
                  </Row>
                </>
              )}
            </Card>

            <Card >
              <Input
                value={inputValue}
                readOnly
                placeholder={activeInput ? 'Editing selected field' : 'Select a field'}
                style={{ fontSize: '18px', textAlign: 'right', height: '50px', marginBottom: '16px' }}
              />
              <Row gutter={[8, 8]}>
                {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0, '.'].map(num => (
                  <Col span={8} key={num}>
                    <Button block size="large" onClick={() => handleKeypadInput(num.toString())}>{num}</Button>
                  </Col>
                ))}
                <Col span={8}>
                  <Button block size="large" danger onClick={() => handleKeypadInput('backspace')}>⌫</Button>
                </Col>
              </Row>
            </Card>

            <Card>
              <Row gutter={16} style={{ width: '100%' }}>
                <Col span={8}>
                  <Button icon={<CloseCircleOutlined />} onClick={onClose} block style={{background:"red",color:"white"}}>
                    Cancel
                  </Button>
                </Col>
                <Col span={8}>
                  <Button icon={<ReloadOutlined />} onClick={handleClearAll} block>
                    Clear All
                  </Button>
                </Col>
                <Col span={8}>
                  <Button 
                    icon={<SaveOutlined />} 
                    type="primary" 
                    loading={loading} 
                    onClick={handleCloseShiftAction} 
                    block
                    disabled={cashEntries.length === 0}
                  >
                    Close Shift
                  </Button>
                </Col>
              </Row>
            </Card>
          </Space>
        </Col>
      </Row>
    </Modal>
  );
};

export default CloseShiftModal;