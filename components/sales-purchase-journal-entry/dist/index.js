function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { JsonApiClient } from 'drupal-canvas';
import { FormattedText } from 'drupal-canvas';
import PageTitle from '@/components/utl-page-title';
import Amount from '@/components/utl-amount';
const client = new JsonApiClient();
export default function PurchaseJournalEntry() {
    var _data_data, _data_data_attributes, _data_data1, _data_data_attributes1, _data_data2, _data_included, _data_included1, _data_data_attributes2, _data_data3, _data_data_attributes3, _data_data4, _data_data_attributes4, _data_data5, _data_data_attributes5, _data_data6, _data_data_attributes6, _data_data7, _data_data_attributes7, _data_data8, _data_data_attributes8, _data_data9, _data_data_attributes9, _data_data10, _data_data_attributes10, _data_data11, _data_data_attributes11, _data_data12, _data_data_attributes12, _data_data13, _data_included2, _data_included3;
    /**--------------------------------------------------------------------------------------------
  * Extract UUID from URL query parameters and fetch the corresponding purchase data via JSON:API.
  * Then display the purchase details and provide a button to post a journal entry for the purchase.
  -------------------------------------------------------------------------------------------*/ const [uuid, setUuid] = useState(null);
    useEffect(()=>{
        const params = new URLSearchParams(window.location.search);
        const uuidParam = params.get('uuid');
        console.log('URL params:', window.location.search);
        console.log('UUID from URL:', uuidParam);
        setUuid(uuidParam);
    }, []);
    console.log('UUID state:', uuid);
    const shouldFetch = typeof uuid === 'string' && uuid.trim().length > 0;
    console.log('Should Fetch:', shouldFetch);
    /**---------------------------------------------------------------------
   * fetch purchase data for the given UUID using SWR. 
   * 
   -----------------------------------------------------------------------*/ const { data, error, isLoading } = useSWR(shouldFetch ? `node--purchase_book--${uuid}` : null, ()=>_async_to_generator(function*() {
            console.log('Fetching individual resource:', uuid);
            try {
                const res = yield fetch(`${window.location.origin}/jsonapi/node/purchase_book/${uuid}?include=field_product_name,field_product_brand,field_product_code,field_product_company,field_product_size,field_sales_department,field_sku,field_vendor`);
                console.log('Fetch response status:', res.status);
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }
                const data_1 = yield res.json();
                console.log('Fetched data:', data_1);
                return data_1;
            } catch (err) {
                console.error('Fetch error:', err);
                throw err;
            }
        })());
    console.log('SWR Data:', data === null || data === void 0 ? void 0 : (_data_data = data.data) === null || _data_data === void 0 ? void 0 : _data_data.attributes);
    console.log('SWR Include:', data === null || data === void 0 ? void 0 : data.included);
    console.log('SWR Error:', error);
    console.log('SWR Loading:', isLoading);
    // Get CSRF token
    function getCsrfToken() {
        return _async_to_generator(function*() {
            try {
                const response = yield fetch("/session/token", {
                    method: "GET",
                    credentials: "include"
                });
                if (!response.ok) {
                    throw new Error(`Failed to get CSRF token: ${response.status}`);
                }
                return yield response.text();
            } catch (error) {
                console.error("CSRF token error:", error);
                throw error;
            }
        })();
    }
    function postJournalForPurchase(item) {
        return _async_to_generator(function*() {
            console.log('Posting journal entry for purchase item:', item);
            try {
                var _item_field_product_name, _item_field_product_name1, _responseData_data_attributes, _responseData_data;
                const token = yield getCsrfToken();
                const today = new Date().toISOString().split('T')[0];
                console.log('Token:', token);
                // Total Purchase Amount
                const totalAmount = item.field_quantity * item.field_cost_price;
                // Reference (link back to purchase)
                const refId = item.drupal_internal__nid;
                const journalEntry = {
                    data: {
                        type: 'node--acc_journal_entry',
                        attributes: {
                            title: `Inventory Purchase - ${item === null || item === void 0 ? void 0 : (_item_field_product_name = item.field_product_name) === null || _item_field_product_name === void 0 ? void 0 : _item_field_product_name.name}`,
                            field_amount: totalAmount,
                            field_date: today,
                            field_purchase_sale_reference_id: refId,
                            field_purchase_sale_reference_ty: 'purchase',
                            field_description: {
                                value: `Purchased ${item.field_quantity} box(es) of ${item === null || item === void 0 ? void 0 : (_item_field_product_name1 = item.field_product_name) === null || _item_field_product_name1 === void 0 ? void 0 : _item_field_product_name1.name}`,
                                format: 'plain_text'
                            },
                            field_comment: {
                                value: `Auto generated purchase entry`,
                                format: 'plain_text'
                            }
                        },
                        relationships: {
                            // Debit → Inventory
                            field_debit_account: {
                                data: {
                                    type: "node--accounting_ledger",
                                    id: "c5343609-65ee-4e0d-926e-20104956edd9"
                                }
                            },
                            // Credit → Cash OR Accounts Payable
                            field_credit_account: {
                                data: {
                                    type: "node--accounting_ledger",
                                    id: "0f92cdfb-9533-47fb-8951-c882369e59bd"
                                }
                            }
                        }
                    }
                };
                // POST
                const res = yield fetch('/jsonapi/node/acc_journal_entry', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/vnd.api+json',
                        'X-CSRF-Token': token
                    },
                    credentials: 'include',
                    body: JSON.stringify(journalEntry)
                });
                const responseData = yield res.json();
                // Get created nodeId (nid)
                const nodeId = responseData === null || responseData === void 0 ? void 0 : (_responseData_data = responseData.data) === null || _responseData_data === void 0 ? void 0 : (_responseData_data_attributes = _responseData_data.attributes) === null || _responseData_data_attributes === void 0 ? void 0 : _responseData_data_attributes.drupal_internal__nid;
                // Redirect to Journal Entry Page
                if (nodeId) {
                    window.location.href = `/acc-journal-entry?nodeId=${nodeId}`;
                }
            } catch (err) {
                console.error('Purchase Journal Error:', err);
            }
        })();
    }
    return /*#__PURE__*/ _jsxs("div", {
        children: [
            /*#__PURE__*/ _jsx(PageTitle, {
                title: "Purchase - Journal Entry"
            }),
            isLoading && /*#__PURE__*/ _jsx("p", {
                children: "Loading..."
            }),
            error && /*#__PURE__*/ _jsxs("div", {
                children: [
                    /*#__PURE__*/ _jsx("p", {
                        children: "Error loading data"
                    }),
                    /*#__PURE__*/ _jsx("pre", {
                        children: JSON.stringify(error, null, 2)
                    })
                ]
            }),
            /*#__PURE__*/ _jsx("div", {
                children: /*#__PURE__*/ _jsxs("div", {
                    className: "py-2 my-2 border-b border-slate-300",
                    children: [
                        /*#__PURE__*/ _jsxs("div", {
                            children: [
                                "Invoice date: ",
                                data === null || data === void 0 ? void 0 : (_data_data1 = data.data) === null || _data_data1 === void 0 ? void 0 : (_data_data_attributes = _data_data1.attributes) === null || _data_data_attributes === void 0 ? void 0 : _data_data_attributes.field_invoice_date
                            ]
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                            children: [
                                "Purchase date: ",
                                data === null || data === void 0 ? void 0 : (_data_data2 = data.data) === null || _data_data2 === void 0 ? void 0 : (_data_data_attributes1 = _data_data2.attributes) === null || _data_data_attributes1 === void 0 ? void 0 : _data_data_attributes1.field_received_date
                            ]
                        }),
                        /*#__PURE__*/ _jsx("div", {
                            className: "mt-4",
                            children: "Product Details:"
                        }),
                        (data === null || data === void 0 ? void 0 : data.included) && (data === null || data === void 0 ? void 0 : (_data_included = data.included) === null || _data_included === void 0 ? void 0 : _data_included.length) > 0 && (data === null || data === void 0 ? void 0 : (_data_included1 = data.included) === null || _data_included1 === void 0 ? void 0 : _data_included1.map((inc)=>{
                            var _inc_attributes;
                            return /*#__PURE__*/ _jsx("div", {
                                children: /*#__PURE__*/ _jsxs("div", {
                                    className: "flex gap-2",
                                    children: [
                                        /*#__PURE__*/ _jsxs("div", {
                                            children: [
                                                inc.type.replace('taxonomy_term--', '').replace('product_', '').replace('_', ' ').replace('node--vendor', '').toUpperCase(),
                                                " :"
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsx("div", {
                                            children: inc === null || inc === void 0 ? void 0 : (_inc_attributes = inc.attributes) === null || _inc_attributes === void 0 ? void 0 : _inc_attributes.name
                                        })
                                    ]
                                })
                            }, inc.id);
                        })),
                        /*#__PURE__*/ _jsxs("div", {
                            className: "py-2",
                            children: [
                                /*#__PURE__*/ _jsx("div", {
                                    className: "uppercase text-xs font-semibold",
                                    children: "Purchased Quantity and Value"
                                }),
                                /*#__PURE__*/ _jsxs("div", {
                                    className: "border border-slate-300 p-2",
                                    children: [
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "grid grid-cols-5 gap-2",
                                            children: [
                                                /*#__PURE__*/ _jsxs("div", {
                                                    children: [
                                                        "Purchased Qty",
                                                        /*#__PURE__*/ _jsx("br", {}),
                                                        "[Box/Case]"
                                                    ]
                                                }),
                                                /*#__PURE__*/ _jsxs("div", {
                                                    children: [
                                                        "Purchase",
                                                        /*#__PURE__*/ _jsx("br", {}),
                                                        "Price per unit"
                                                    ]
                                                }),
                                                /*#__PURE__*/ _jsxs("div", {
                                                    children: [
                                                        "Purchased Price",
                                                        /*#__PURE__*/ _jsx("br", {}),
                                                        "[Box/Case]"
                                                    ]
                                                }),
                                                /*#__PURE__*/ _jsx("div", {
                                                    children: "Purchased Cost"
                                                }),
                                                /*#__PURE__*/ _jsx("div", {
                                                    children: "Trade Value"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "grid grid-cols-5 gap-2 text-center",
                                            children: [
                                                /*#__PURE__*/ _jsxs("div", {
                                                    className: "text-center",
                                                    children: [
                                                        data === null || data === void 0 ? void 0 : (_data_data3 = data.data) === null || _data_data3 === void 0 ? void 0 : (_data_data_attributes2 = _data_data3.attributes) === null || _data_data_attributes2 === void 0 ? void 0 : _data_data_attributes2.field_quantity,
                                                        /*#__PURE__*/ _jsx("br", {}),
                                                        /*#__PURE__*/ _jsxs("span", {
                                                            className: "text-xs",
                                                            children: [
                                                                "[ in units: ",
                                                                (data === null || data === void 0 ? void 0 : (_data_data4 = data.data) === null || _data_data4 === void 0 ? void 0 : (_data_data_attributes3 = _data_data4.attributes) === null || _data_data_attributes3 === void 0 ? void 0 : _data_data_attributes3.field_quantity) * (data === null || data === void 0 ? void 0 : (_data_data5 = data.data) === null || _data_data5 === void 0 ? void 0 : (_data_data_attributes4 = _data_data5.attributes) === null || _data_data_attributes4 === void 0 ? void 0 : _data_data_attributes4.field_unit_per_box),
                                                                "]"
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ _jsx("div", {
                                                    className: "text-center",
                                                    children: /*#__PURE__*/ _jsx(Amount, {
                                                        amt: (data === null || data === void 0 ? void 0 : (_data_data6 = data.data) === null || _data_data6 === void 0 ? void 0 : (_data_data_attributes5 = _data_data6.attributes) === null || _data_data_attributes5 === void 0 ? void 0 : _data_data_attributes5.field_cost_price) / (data === null || data === void 0 ? void 0 : (_data_data7 = data.data) === null || _data_data7 === void 0 ? void 0 : (_data_data_attributes6 = _data_data7.attributes) === null || _data_data_attributes6 === void 0 ? void 0 : _data_data_attributes6.field_unit_per_box)
                                                    })
                                                }),
                                                /*#__PURE__*/ _jsx("div", {
                                                    className: "text-center",
                                                    children: /*#__PURE__*/ _jsx(Amount, {
                                                        amt: data === null || data === void 0 ? void 0 : (_data_data8 = data.data) === null || _data_data8 === void 0 ? void 0 : (_data_data_attributes7 = _data_data8.attributes) === null || _data_data_attributes7 === void 0 ? void 0 : _data_data_attributes7.field_cost_price
                                                    })
                                                }),
                                                /*#__PURE__*/ _jsx("div", {
                                                    className: "text-center",
                                                    children: /*#__PURE__*/ _jsx(Amount, {
                                                        amt: (data === null || data === void 0 ? void 0 : (_data_data9 = data.data) === null || _data_data9 === void 0 ? void 0 : (_data_data_attributes8 = _data_data9.attributes) === null || _data_data_attributes8 === void 0 ? void 0 : _data_data_attributes8.field_quantity) * (data === null || data === void 0 ? void 0 : (_data_data10 = data.data) === null || _data_data10 === void 0 ? void 0 : (_data_data_attributes9 = _data_data10.attributes) === null || _data_data_attributes9 === void 0 ? void 0 : _data_data_attributes9.field_cost_price)
                                                    })
                                                }),
                                                /*#__PURE__*/ _jsx("div", {
                                                    className: "text-center",
                                                    children: /*#__PURE__*/ _jsx(Amount, {
                                                        amt: (data === null || data === void 0 ? void 0 : (_data_data11 = data.data) === null || _data_data11 === void 0 ? void 0 : (_data_data_attributes10 = _data_data11.attributes) === null || _data_data_attributes10 === void 0 ? void 0 : _data_data_attributes10.field_quantity) * (data === null || data === void 0 ? void 0 : (_data_data12 = data.data) === null || _data_data12 === void 0 ? void 0 : (_data_data_attributes11 = _data_data12.attributes) === null || _data_data_attributes11 === void 0 ? void 0 : _data_data_attributes11.field_selling_price)
                                                    })
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ _jsx("div", {
                            className: "p-2 border border-slate-300",
                            children: /*#__PURE__*/ _jsxs("div", {
                                className: "uppercase text-sm font-bold",
                                children: [
                                    "Units Per Box/Case: ",
                                    data === null || data === void 0 ? void 0 : (_data_data13 = data.data) === null || _data_data13 === void 0 ? void 0 : (_data_data_attributes12 = _data_data13.attributes) === null || _data_data_attributes12 === void 0 ? void 0 : _data_data_attributes12.field_unit_per_box
                                ]
                            })
                        }),
                        (data === null || data === void 0 ? void 0 : data.included) && (data === null || data === void 0 ? void 0 : (_data_included2 = data.included) === null || _data_included2 === void 0 ? void 0 : _data_included2.length) > 0 && (data === null || data === void 0 ? void 0 : (_data_included3 = data.included) === null || _data_included3 === void 0 ? void 0 : _data_included3.map((inc)=>{
                            var _inc_attributes, _inc_attributes1, _inc_attributes_field_address, _inc_attributes2, _inc_attributes3, _inc_attributes_field_phone_number, _inc_attributes4, _inc_attributes_field_contact_person, _inc_attributes5;
                            return inc.type === 'node--vendor' && /*#__PURE__*/ _jsxs("div", {
                                className: "py-2",
                                children: [
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "uppercase text-xs font-semibold",
                                        children: [
                                            "Vendor : ",
                                            inc === null || inc === void 0 ? void 0 : (_inc_attributes = inc.attributes) === null || _inc_attributes === void 0 ? void 0 : _inc_attributes.field_date
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsx("div", {
                                        children: inc === null || inc === void 0 ? void 0 : (_inc_attributes1 = inc.attributes) === null || _inc_attributes1 === void 0 ? void 0 : _inc_attributes1.title
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "text-sm",
                                        children: [
                                            /*#__PURE__*/ _jsx("div", {
                                                children: /*#__PURE__*/ _jsx(FormattedText, {
                                                    children: inc === null || inc === void 0 ? void 0 : (_inc_attributes2 = inc.attributes) === null || _inc_attributes2 === void 0 ? void 0 : (_inc_attributes_field_address = _inc_attributes2.field_address) === null || _inc_attributes_field_address === void 0 ? void 0 : _inc_attributes_field_address.value
                                                })
                                            }),
                                            /*#__PURE__*/ _jsxs("div", {
                                                children: [
                                                    "Email: ",
                                                    (_inc_attributes3 = inc.attributes) === null || _inc_attributes3 === void 0 ? void 0 : _inc_attributes3.field_email
                                                ]
                                            }),
                                            /*#__PURE__*/ _jsxs("div", {
                                                children: [
                                                    "Phone: ",
                                                    inc === null || inc === void 0 ? void 0 : (_inc_attributes4 = inc.attributes) === null || _inc_attributes4 === void 0 ? void 0 : (_inc_attributes_field_phone_number = _inc_attributes4.field_phone_number) === null || _inc_attributes_field_phone_number === void 0 ? void 0 : _inc_attributes_field_phone_number.join(' | ')
                                                ]
                                            }),
                                            /*#__PURE__*/ _jsxs("div", {
                                                children: [
                                                    "Contact Person: ",
                                                    inc === null || inc === void 0 ? void 0 : (_inc_attributes5 = inc.attributes) === null || _inc_attributes5 === void 0 ? void 0 : (_inc_attributes_field_contact_person = _inc_attributes5.field_contact_person) === null || _inc_attributes_field_contact_person === void 0 ? void 0 : _inc_attributes_field_contact_person.join(' | ')
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }, inc.id);
                        })),
                        /*#__PURE__*/ _jsx("div", {
                            className: "py-2",
                            children: /*#__PURE__*/ _jsx("button", {
                                className: "cursor-pointer px-4 py-2 border bg-slate-600 text-white",
                                onClick: ()=>{
                                    var _data_data;
                                    return postJournalForPurchase(data === null || data === void 0 ? void 0 : (_data_data = data.data) === null || _data_data === void 0 ? void 0 : _data_data.attributes);
                                },
                                children: "Post Journal Entry"
                            })
                        })
                    ]
                })
            }),
            !data && /*#__PURE__*/ _jsx("p", {
                children: "No purchase data found for the given UUID."
            })
        ]
    });
}
