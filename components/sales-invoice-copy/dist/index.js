import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { JsonApiClient } from 'drupal-canvas';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { FormattedText } from 'drupal-canvas';
import PageTitle from '@/components/utl-page-title';
import Amount from '@/components/utl-amount';
const client = new JsonApiClient();
export default function sales_invoice_copy() {
    var _data__field_customer_id_field_phone_number, _data__field_sales_invoice_items, _data_, _data__field_notes, _data_1;
    /**----------------------------------------------------------------
 *  UUID FROM THE SALES LIST
 ------------------------------------------------------------------*/ const [nodeId, setNodeId] = useState('');
    useEffect(()=>{
        const params = new URLSearchParams(window.location.search);
        const id = params.get('nodeId');
        console.log('Node Id : ', id);
        setNodeId(id);
    }, []);
    /**----------------------------------------------------------------------
 * FETCH data for invoice copy from content type 'invoice'
 ------------------------------------------------------------------------*/ const { data, error, isLoading } = useSWR([
        'node--invoice',
        {
            queryString: new DrupalJsonApiParams().addInclude([
                'field_sales_invoice_items',
                'field_customer_id'
            ]).addFilter('drupal_internal__nid', nodeId, '=') // Exclude current article by uuid.
            .getQueryString()
        }
    ], ([type, options])=>client.getCollection(type, options));
    console.log('DATA', data, error, isLoading);
    if (error) return /*#__PURE__*/ _jsx("div", {
        children: "Loading error..."
    });
    if (isLoading) return /*#__PURE__*/ _jsx("div", {
        children: "Loading ..."
    });
    return /*#__PURE__*/ _jsxs("div", {
        children: [
            /*#__PURE__*/ _jsx(PageTitle, {
                title: "Invoice Copy"
            }),
            /*#__PURE__*/ _jsxs("div", {
                children: [
                    /*#__PURE__*/ _jsxs("div", {
                        children: [
                            /*#__PURE__*/ _jsxs("div", {
                                children: [
                                    "Date: ",
                                    data[0].field_invoice_date
                                ]
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                children: [
                                    "Invoice Number: ",
                                    data[0].field_invoice_number
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsxs("div", {
                        className: "my-2",
                        children: [
                            /*#__PURE__*/ _jsxs("div", {
                                children: [
                                    "Customer Code: ",
                                    data[0].field_customer_id.field_customer_code
                                ]
                            }),
                            /*#__PURE__*/ _jsx("div", {
                                children: data[0].field_customer_id.title
                            }),
                            /*#__PURE__*/ _jsx("div", {
                                children: /*#__PURE__*/ _jsx(FormattedText, {
                                    children: data[0].field_customer_id.field_address.value
                                })
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                className: "flex",
                                children: [
                                    /*#__PURE__*/ _jsx("div", {
                                        children: "Phone:"
                                    }),
                                    " ",
                                    (_data__field_customer_id_field_phone_number = data[0].field_customer_id.field_phone_number) === null || _data__field_customer_id_field_phone_number === void 0 ? void 0 : _data__field_customer_id_field_phone_number.map((item)=>/*#__PURE__*/ _jsx("div", {
                                            className: "mx-2",
                                            children: item
                                        }))
                                ]
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                children: [
                                    "Email:  ",
                                    data[0].field_customer_id.field_email
                                ]
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                children: [
                                    "Tax Id: ",
                                    data[0].field_customer_id.field_tax_id
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsxs("div", {
                        className: "my-2 border-t border-b",
                        children: [
                            /*#__PURE__*/ _jsxs("div", {
                                className: "flex gap-2",
                                children: [
                                    /*#__PURE__*/ _jsx("div", {
                                        className: "w-96",
                                        children: "Product"
                                    }),
                                    /*#__PURE__*/ _jsx("div", {
                                        className: "w-12",
                                        children: "Qty"
                                    }),
                                    /*#__PURE__*/ _jsx("div", {
                                        className: "w-32",
                                        children: "Rate"
                                    }),
                                    /*#__PURE__*/ _jsx("div", {
                                        className: "w-32",
                                        children: "Amount"
                                    })
                                ]
                            }),
                            (_data__field_sales_invoice_items = data[0].field_sales_invoice_items) === null || _data__field_sales_invoice_items === void 0 ? void 0 : _data__field_sales_invoice_items.map((item)=>{
                                return /*#__PURE__*/ _jsxs("div", {
                                    className: "flex gap-2",
                                    children: [
                                        /*#__PURE__*/ _jsx("div", {
                                            className: "w-96",
                                            children: item === null || item === void 0 ? void 0 : item.title
                                        }),
                                        /*#__PURE__*/ _jsx("div", {
                                            className: "w-12",
                                            children: item === null || item === void 0 ? void 0 : item.field_product_quantity_units
                                        }),
                                        /*#__PURE__*/ _jsx("div", {
                                            className: "w-32",
                                            children: /*#__PURE__*/ _jsx(Amount, {
                                                amt: item === null || item === void 0 ? void 0 : item.field_product_unit_price
                                            })
                                        }),
                                        /*#__PURE__*/ _jsx("div", {
                                            className: "w-32",
                                            children: /*#__PURE__*/ _jsx(Amount, {
                                                amt: (item === null || item === void 0 ? void 0 : item.field_product_unit_price) * (item === null || item === void 0 ? void 0 : item.field_product_quantity_units)
                                            })
                                        })
                                    ]
                                }, item.id);
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                className: "flex gap-2 my-2 border-t border-slate-300",
                                children: [
                                    /*#__PURE__*/ _jsx("div", {
                                        className: "w-96",
                                        children: "Total Amount"
                                    }),
                                    /*#__PURE__*/ _jsx("div", {
                                        className: "w-12"
                                    }),
                                    /*#__PURE__*/ _jsx("div", {
                                        className: "w-32"
                                    }),
                                    /*#__PURE__*/ _jsx("div", {
                                        className: "w-32",
                                        children: /*#__PURE__*/ _jsx(Amount, {
                                            amt: (_data_ = data[0]) === null || _data_ === void 0 ? void 0 : _data_.field_total_amount
                                        })
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsxs("div", {
                        className: "py-2",
                        children: [
                            /*#__PURE__*/ _jsx("div", {
                                children: "Note:"
                            }),
                            /*#__PURE__*/ _jsx("div", {
                                children: /*#__PURE__*/ _jsx(FormattedText, {
                                    children: (_data_1 = data[0]) === null || _data_1 === void 0 ? void 0 : (_data__field_notes = _data_1.field_notes) === null || _data__field_notes === void 0 ? void 0 : _data__field_notes.value
                                })
                            })
                        ]
                    })
                ]
            })
        ]
    });
}
