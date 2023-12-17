import React, { useEffect, useState } from 'react'
import SideNavBar from '../Components/SideNavBar'
import TopNavBar from '../Components/TopNavBar'
import CustomTable from '../Components/CustomTable'
import { Button, Dropdown, Form, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { CUSTOMER_COLLECTION, TRANSACTION_COLLECTION } from '../Utils/DataUtils'
import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc, query, where } from 'firebase/firestore'
import moment from 'moment'
import { calculateTotal } from '../Utils/Utils'
import { DigitFormatter, PaymentTypeList, StatusTypeList, filterByList } from '../Utils/General'
import { isEmpty } from 'ramda'
import Select from 'react-select'

function Transaction() {

  const navigate = useNavigate()
  const transactionCollectionRef = collection(db, TRANSACTION_COLLECTION)
  const customerCollectionRef = collection(db, CUSTOMER_COLLECTION)

  const [transactionData, setTransactionData] = useState([])
  const [customerList, setCustomerList] = useState([])
  const [productList, setProductList] = useState([])

  // FILTER
  const [filterField, setFilterField] = useState('')

  const getTransactionList = async () => {
    const data = await getDocs(transactionCollectionRef)
    const sortedData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    setTransactionData(sortedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
  }

  const getCustomer = async () => {
    const data = await getDocs(customerCollectionRef)
    const sortedData = data.docs.map((doc) => ({ id: doc.id, label: `${doc.data().name}(${doc.data().contact_person})`, value: doc.data() }))
    setCustomerList(sortedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
  }
  useEffect(() => {
    getTransactionList()
    getCustomer()
  }, [])

  const filterByOrderNumber = async (order_number) => {
    const q = query(collection(db, TRANSACTION_COLLECTION)
      , where('order_number', '==', order_number))
    const querySnapshot = await getDocs(q)
    const result = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    setTransactionData(result)

    // if (!querySnapshot.empty) {
    //   setTransactionData(result)
    //   console.log('RESULT', result[0]);
    // } else {
    //   console.log('FAILED');
    // }
  }

  // const searchCustomer = async (customerName) => {
  //   const q = query(collection(db, CUSTOMER_COLLECTION.toString()))
  //   const querySnapshot = await getDocs(q);
  //   console.log(querySnapshot.docs
  //     .map(doc => doc.data()))
  //   const result = querySnapshot.docs
  //     .map(doc => doc.data())
  //     .filter((e) => e.name.toLowerCase()
  //       .includes(customerName.toLowerCase()))
  //   setTransactionData(result)
  // }



  const searchElement = () => {
    switch (filterField) {
      case 'Nomor Transaksi':
        return (
          <Form.Control
            isInvalid={false}
            type="input"
            name='filterTransaction'
            onChange={(e) => {
              setTimeout(() => {
                filterByOrderNumber(e.target.value)
              }, 500);
            }}
            placeholder="Pencarian..."
          />
        )
        break;
      case 'Customer':
        return (
          <Select
            options={customerList}
            placeholder="Pilih customer"
            onChange={(e) => {
              // setSelectedCustomer(e.id)
            }}
          />
        )
        break;
      case 'Jenis':
        return (
          <Select
            options={PaymentTypeList}
            placeholder="Jenis Pembayaran"
            onChange={(e) => {
              // setSelectedCustomer(e.id)
            }}
          />
        )
        break;
      case 'Tanggal':
        return (
          <Form.Control
            type="date"
            // name='orderDate'
            // value={orderDate}
            onChange={(e) => {
              // setOrderDate(e.target.value)
            }}
            placeholder="Tanggal order"
          />
        )
        break;
      case 'Status':
        return (
          <Select
            options={StatusTypeList}
            placeholder="Status Order"
            onChange={(e) => {
              console.log(e)
            }}
          />
        )
        break;
      default:
        return (
          null
        )
        break;
    }
  }

  return (
    <div>
      <SideNavBar />
      <main class="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
        <TopNavBar />
        <div class="container-fluid py-4">
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
              <h2>Transaksi</h2>
              <h6>Data transaksi JAA Alkesum</h6>
            </div>
            <div className="col-lg-8 col-md-3" style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
              <Button
                style={{ width: '40%', alignSelf: 'flex-end' }}
                onClick={() => {
                  navigate('/transaction/new-transaction')
                }}
              >+ Tambah Transaksi Baru</Button>
            </div>
          </div>

          <Row style={{ marginTop: 20, marginBottom: -20 }}>
            <Dropdown className='col-lg-2'>
              <Dropdown.Toggle className='col-lg-12' variant="success" id="dropdown-basic">
                {isEmpty(filterField) ? 'Filter' : filterField}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {filterByList.map(({ label, value }) => {
                  return (
                    <Dropdown.Item
                      onClick={() => setFilterField(label)}
                    >{label}</Dropdown.Item>
                  )
                })}
              </Dropdown.Menu>
            </Dropdown>
            <Form.Group className="col-lg-4 col-md-3" controlId='filterTransaction'>
              {searchElement()}
            </Form.Group>
          </Row>

          <div class="row mt-4">
            <div className="card-body px-0 pb-2">
              <div className="table-responsive">
                <table className="table align-items-center mb-0">
                  <thead>
                    <tr>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No.</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nomor Transaksi</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Customer</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Jenis</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Tanggal</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionData?.map((item, index) => {
                      return (
                        <tr>
                          <td>
                            <div className="ps-3 py-1">
                              <div className="d-flex flex-column justify-content-center">
                                <h6 className="mb-0 text-sm">{index + 1}</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="ps-3 py-1">
                              <div className="d-flex flex-column justify-content-center">
                                <h6
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    navigate(`/transaction/detail/${item?.order_number}`)
                                  }}
                                  className="mb-0 text-sm">{item?.order_number}</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="ps-3 py-1">
                              <div className="d-flex flex-column">
                                <h6 className="mb-0 text-sm">{item?.customer?.name}</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="ps-3 py-1">
                              <div className="d-flex flex-column">
                                <h6 className="mb-0 text-sm">{item?.type}</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="ps-3 py-1">
                              <div className="d-flex flex-column">
                                <h6 className="mb-0 text-sm">{item?.status ? 'Aktif' : 'Non-Aktif'}</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="ps-3 py-1">
                              <div className="d-flex flex-column">
                                <h6 className="mb-0 text-sm">{moment(item.created_at).format('DD MMM YYYY')}</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="ps-3 py-1">
                              <div className="d-flex flex-column">
                                <h6 className="mb-0 text-sm">{`Rp${DigitFormatter(calculateTotal(item?.order_list))}`}</h6>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    })}

                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default Transaction