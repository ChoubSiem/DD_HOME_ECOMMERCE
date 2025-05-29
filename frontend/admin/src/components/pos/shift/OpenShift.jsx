import React, { useState, useRef } from 'react';
import { Modal, Row, Col, Card, Input, Button, Typography, Divider, Space, message } from 'antd';
import { DollarOutlined, CalculatorOutlined, SaveOutlined, ReloadOutlined, CloseCircleOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
const { Title, Text } = Typography;
import { useSale } from '../../../hooks/UseSale';

const OpenShiftModal = ({ visible, onClose, onShiftOpen }) => {
  const [amount, setAmount] = useState('');
  const {handleOpenShiftCreate} = useSale();
  const [loading, setLoading] = useState(false);
  const [usdDenominations, setUsdDenominations] = useState({
     50: 0, 20: 0, 10: 0, 5: 0, 1: 0, 0.25: 0
  });
  const [rielDenominations, setRielDenominations] = useState({
    50000: 0, 20000: 0, 10000: 0, 5000: 0,
    2000: 0, 1000: 0, 500: 0, 100: 0,
  });
  const [activeInput, setActiveInput] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const calculateTotal = (denominations) => {
    return Object.entries(denominations).reduce((total, [denom, count]) => {
      return total + (parseFloat(denom) * (parseFloat(count) || 0));
    }, 0);
  };

  const usdTotal = calculateTotal(usdDenominations);
  const rielTotal = calculateTotal(rielDenominations);
  const totalAmount = usdTotal + (rielTotal / 4000); 
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
      const [currency, denom] = activeInput.split('_');

      if (currency === 'usd') {
        setUsdDenominations(prev => ({ ...prev, [denom]: numericValue }));
      } else if (currency === 'riel') {
        setRielDenominations(prev => ({ ...prev, [denom]: numericValue }));
      }
    }
  };

  const handleInputFocus = (fieldId, currentValue, event) => {
    setActiveInput(fieldId);
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
    setUsdDenominations({
       50: 0, 20: 0, 10: 0, 5: 0, 1: 0, 0.25: 0
    });
    setRielDenominations({
       50000: 0, 20000: 0, 10000: 0, 5000: 0,
      2000: 0, 1000: 0, 500: 0, 100: 0,
    });
    setInputValue('');
    setActiveInput(null);
    setAmount('');
  };

  const handleOpenShift = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(Cookies.get("user") || {});
      
      const cash_detail = [];
      
      Object.entries(usdDenominations).forEach(([denomination, count]) => {
        if (count > 0) {
          cash_detail.push({
            money_number: parseFloat(count),
            currency: 'USD',
            money_type: parseFloat(denomination),
            total: parseFloat(denomination) * parseFloat(count)
          });
        }
      });

      Object.entries(rielDenominations).forEach(([denomination, count]) => {
        if (count > 0) {
          cash_detail.push({
            money_number: parseFloat(count),
            currency: 'KHR',
            money_type: parseFloat(denomination),
            total: parseFloat(denomination) * parseFloat(count)
          });
        }
      });
      const now = new Date();
      const localTime = now.toLocaleString(); 
      const shiftData = {
        total_usd: usdTotal,
        total_kh: rielTotal,
        start_time: localTime,
        user_id: userData.id,
        cash_detail,
        warehouse_id:userData.warehouse_id
      };

      // console.log("Shift opening data:", shiftData); 
      // return;
      const response = await handleOpenShiftCreate(shiftData,token)
      // console.log(response);
      
      if (!response.success) {
        throw new Error('Failed to open shift');
      }else{
        Cookies.set('is_open_shift' , true);
        Cookies.set('shift_id' , response.shift.id);
        location.reload();
      }
      

      const responseData = await response.shift;
      onShiftOpen({
        shiftId: responseData.id || `shift_${Date.now()}`,
        ...shiftData
      });

      message.success('Shift opened successfully');
      onClose();
    } catch (error) {
      console.error('Shift opening error:', error);
      message.error(error.message || 'Failed to open shift');
    } finally {
      setLoading(false);
    }
  };

  const renderDenominationInputs = (denoms, currency) => {
    return (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {Object.entries(denoms).map(([denom, count]) => (
          <Row key={`${currency}_${denom}`} gutter={16} align="middle">
            <Col span={8}>
              <Text strong>{currency === 'USD' ? '$' : '៛'}{denom}</Text>
            </Col>
            <Col span={16}>
              <Input
                type="number"
                min={0}
                step={denom.includes('.') ? '0.01' : '1'}
                value={count}
                onChange={(e) => {
                  const value = e.target.value;
                  const numericValue = parseFloat(value) || 0;
                  if (currency === 'USD') {
                    setUsdDenominations(prev => ({ ...prev, [denom]: numericValue }));
                  } else {
                    setRielDenominations(prev => ({ ...prev, [denom]: numericValue }));
                  }
                }}
                onFocus={(e) => handleInputFocus(`${currency.toLowerCase()}_${denom}`, count, e)}
                style={{ textAlign: 'right' }}
              />
            </Col>
          </Row>
        ))}
      </Space>
    );
  };

  return (
    <Modal
      title={<><DollarOutlined /> Open New Shift</>}
      open={visible}
      onCancel={onClose}
      footer={null}
      width="80%"
      destroyOnClose
    >
      <Row gutter={24}>
        <Col span={12}>
          <Card>
            
            <div >
              <Title level={5}><DollarOutlined /> USD</Title>
              {renderDenominationInputs(usdDenominations, 'USD')}
              <Divider />
              <Title level={5}>🇰🇭 Riel</Title>
              {renderDenominationInputs(rielDenominations, 'KHR')}
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Card title="Shift Summary">
              <Divider />
              <Row justify="space-between">
                <Col><Text strong>USD Total:</Text></Col>
                <Col><Text>{formatCurrency(usdTotal, 'USD')}</Text></Col>
              </Row>
              <Row justify="space-between">
                <Col><Text strong>Riel Total:</Text></Col>
                <Col><Text>{formatCurrency(rielTotal, 'KHR')}</Text></Col>
              </Row>
              <Divider />
              <Row justify="space-between">
                <Col><Text strong>Total Counted:</Text></Col>
                <Col><Text strong>${totalAmount.toFixed(2)}</Text></Col>
              </Row>
            </Card>

            <Card >
              <Input
                value={inputValue}
                readOnly
                placeholder={activeInput ? `Editing ${activeInput.split('_')[1]} ${activeInput.includes('usd') ? 'USD' : 'Riel'}` : 'Select a field'}
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
                    Later
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
                    onClick={handleOpenShift} 
                    block
                  >
                    Open Shift
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

export default OpenShiftModal;