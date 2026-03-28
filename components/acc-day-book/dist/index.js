import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { JsonApiClient } from 'drupal-canvas';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import PageTitle from '@/components/utl-page-title';
import Amount from '@/components/utl-amount';
import Button from '@/components/utl-button';
/* --------------------------------------------------
   Drupal JSON:API Client
-------------------------------------------------- */ const client = new JsonApiClient();
export default function DayBook() {
    /* --------------------------------------------------
     State: Date Filters (default = defined fiscal year)
  -------------------------------------------------- */ const [datePickedFrom, setDatePickedFrom] = useState('');
    const [datePickedTo, setDatePickedTo] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    /* --------------------------------------------------
           Fetch: Financial Year
        -------------------------------------------------- */ const { data: fy, error: fyError, isLoading: fyIsLoading } = useSWR([
        'node--financial_year',
        {
            queryString: new DrupalJsonApiParams().addSort([
                '-created'
            ]).getQueryString()
        }
    ], ([type, options])=>client.getCollection(type, options));
    useEffect(()=>{
        if (!fy || fy.length === 0) return;
        if (!datePickedFrom && !datePickedTo) {
            setDateFrom(fy[0].field_date_from);
            setDateTo(fy[0].field_date_to);
        } else {
            setDateFrom(datePickedFrom);
            setDateTo(datePickedTo);
        }
    }, [
        fy,
        datePickedFrom,
        datePickedTo
    ]);
    /* --------------------------------------------------
     Fetch: Journal Entries (filtered by date range)
  -------------------------------------------------- */ const { data, error, isLoading } = useSWR([
        'node--acc_journal_entry',
        dateFrom,
        dateTo,
        {
            queryString: new DrupalJsonApiParams().addInclude([
                'field_credit_account.field_account_type',
                'field_debit_account.field_account_type'
            ]).addFilter('field_date', dateFrom, '>=').addFilter('field_date', dateTo, '<=').addSort([
                '-field_date'
            ]).getQueryString()
        }
    ], ([type, , , options])=>client.getCollection(type, options));
    /* --------------------------------------------------
     Export filtered data to CSV
  -------------------------------------------------- */ const exportToCSV = ()=>{
        if (!data) return;
        const headers = [
            'Date',
            'Title',
            'Debit Ledger Name',
            'Debit Account Type',
            'Debit Amount',
            'Credit Ledger Name',
            'Credit Account Type',
            'Credit Amount'
        ];
        const rows = data.map((entry)=>[
                entry.field_date,
                entry.title,
                entry.field_debit_account.field_ledger_account_name,
                entry.field_debit_account.field_account_type.name,
                entry.field_amount,
                entry.field_credit_account.field_ledger_account_name,
                entry.field_credit_account.field_account_type.name,
                entry.field_amount
            ]);
        const csvContent = [
            headers,
            ...rows
        ].map((row)=>row.map((value)=>`"${String(value !== null && value !== void 0 ? value : '').replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([
            csvContent
        ], {
            type: 'text/csv;charset=utf-8;'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'day-book.csv';
        link.click();
        URL.revokeObjectURL(url);
    };
    /* --------------------------------------------------
     Render States
  -------------------------------------------------- */ if (error) return 'An error has occurred.';
    if (isLoading) return 'Loading...';
    /* --------------------------------------------------
     Render UI
  -------------------------------------------------- */ return /*#__PURE__*/ _jsxs("div", {
        children: [
            /*#__PURE__*/ _jsx("div", {
                className: "flex gap-10 items-center mb-4",
                children: /*#__PURE__*/ _jsx("button", {
                    onClick: exportToCSV,
                    children: /*#__PURE__*/ _jsx(Button, {
                        children: "Export CSV"
                    })
                })
            }),
            /*#__PURE__*/ _jsxs("form", {
                className: "flex flex-wrap gap-4 mb-6 p-4 border",
                onSubmit: (e)=>e.preventDefault(),
                children: [
                    /*#__PURE__*/ _jsxs("div", {
                        children: [
                            /*#__PURE__*/ _jsx("label", {
                                className: "block text-sm font-semibold mb-1",
                                children: "Date From"
                            }),
                            /*#__PURE__*/ _jsx("input", {
                                type: "date",
                                value: dateFrom,
                                onChange: (e)=>setDateFrom(e.target.value),
                                className: "border px-2 py-1 rounded"
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsxs("div", {
                        children: [
                            /*#__PURE__*/ _jsx("label", {
                                className: "block text-sm font-semibold mb-1",
                                children: "Date To"
                            }),
                            /*#__PURE__*/ _jsx("input", {
                                type: "date",
                                value: dateTo,
                                onChange: (e)=>setDateTo(e.target.value),
                                className: "border px-2 py-1 rounded"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ _jsx(PageTitle, {
                title: "Day Book"
            }),
            /*#__PURE__*/ _jsxs("div", {
                className: "flex text-xs uppercase gap-1",
                children: [
                    /*#__PURE__*/ _jsx("div", {
                        className: "w-28 border-b",
                        children: "Date"
                    }),
                    /*#__PURE__*/ _jsx("div", {
                        className: "w-52 border-b",
                        children: "Title"
                    }),
                    /*#__PURE__*/ _jsx("div", {
                        className: "w-52 border-b",
                        children: "Debit Ledger Name"
                    }),
                    /*#__PURE__*/ _jsx("div", {
                        className: "w-28 border-b",
                        children: "Account Type"
                    }),
                    /*#__PURE__*/ _jsx("div", {
                        className: "w-52 border-b",
                        children: "Credit Ledger Name"
                    }),
                    /*#__PURE__*/ _jsx("div", {
                        className: "w-28 border-b",
                        children: "Account Type"
                    }),
                    /*#__PURE__*/ _jsx("div", {
                        className: "w-28 border-b",
                        children: "Amount"
                    }),
                    /*#__PURE__*/ _jsx("div", {
                        className: "w-28 border-b",
                        children: "Link to Journal"
                    })
                ]
            }),
            (data === null || data === void 0 ? void 0 : data.length) === 0 && /*#__PURE__*/ _jsx("div", {
                className: "mt-4 text-gray-500",
                children: "No entries found"
            }),
            data === null || data === void 0 ? void 0 : data.map((entry)=>/*#__PURE__*/ _jsxs("div", {
                    className: "flex text-sm gap-1",
                    children: [
                        /*#__PURE__*/ _jsx("div", {
                            className: "w-28 border-b",
                            children: entry.field_date
                        }),
                        /*#__PURE__*/ _jsx("div", {
                            className: "w-52 border-b",
                            children: entry.title
                        }),
                        /*#__PURE__*/ _jsx("div", {
                            className: "w-52 border-b",
                            children: entry.field_debit_account.field_ledger_account_name
                        }),
                        /*#__PURE__*/ _jsx("div", {
                            className: "w-28 border-b",
                            children: entry.field_debit_account.field_account_type.name
                        }),
                        /*#__PURE__*/ _jsx("div", {
                            className: "w-52 border-b",
                            children: entry.field_credit_account.field_ledger_account_name
                        }),
                        /*#__PURE__*/ _jsx("div", {
                            className: "w-28 border-b",
                            children: entry.field_credit_account.field_account_type.name
                        }),
                        /*#__PURE__*/ _jsx("div", {
                            className: "w-28 border-b",
                            children: /*#__PURE__*/ _jsx(Amount, {
                                amt: entry.field_amount
                            })
                        }),
                        /*#__PURE__*/ _jsx("div", {
                            className: "w-28 border-b flex justify-center item-center",
                            children: /*#__PURE__*/ _jsx("a", {
                                className: "border",
                                href: `/acc-journal-entry/?nodeId=${entry.drupal_internal__nid}`,
                                children: "JRN"
                            })
                        })
                    ]
                }, entry.id))
        ]
    });
}
