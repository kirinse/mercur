import { PencilSquare, User } from "@medusajs/icons"
import { Container, createDataTableColumnHelper, usePrompt } from "@medusajs/ui"
import { keepPreviousData } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { DataTable } from "../../../../../../../../node_modules/@medusajs/dashboard/src/components/data-table"
import { useDataTableDateColumns } from "../../../../../../../../node_modules/@medusajs/dashboard/src/components/data-table/helpers/general/use-data-table-date-columns"
import { useDataTableDateFilters } from "../../../../../../../../node_modules/@medusajs/dashboard/src/components/data-table/helpers/general/use-data-table-date-filters"
import { useQueryParams } from "../../../../../../../../node_modules/@medusajs/dashboard/src/hooks/use-query-params"
import {
    useSellers,
    useUpdateSeller
} from '../../../hooks/api/sellers'
import { VendorSeller } from "../../../types/seller"
import { SellerStatusBadge } from "./seller-status-badge"

const PAGE_SIZE = 20

export const SellerListTable = () => {
    const { q, order, offset } = useQueryParams(["q", "order", "offset"])
    const { sellers, count, isPending, isError, error } = useSellers(
        {
            fields: 'id,email,name,store_status,created_at,updated_at',
            q,
            order,
            offset: offset ? parseInt(offset) : 0,
            limit: PAGE_SIZE,
        },
        {
            placeholderData: keepPreviousData,
        }
    )
    const { t } = useTranslation('b2c')
    const columns = useColumns()
    const filters = useFilters()

    if (isError) {
        throw error
    }

    return (
        <Container className="p-0">
            <DataTable
                data={sellers}
                columns={columns}
                filters={filters}
                enableFilterMenu={false} // TODO: watch this bug
                getRowId={(row) => row.id}
                rowCount={count}
                pageSize={PAGE_SIZE}
                heading={t("seller.domain")}
                rowHref={(row) => `${row.id}`}
                isLoading={isPending}
                action={{
                    label: t("seller.actions.invite.title"),
                    to: "invite",
                }}
                emptyState={{
                    empty: {
                        heading: t("seller.list.empty.heading"),
                        description: t("seller.list.empty.description"),
                    },
                    filtered: {
                        heading: t("seller.list.filtered.heading"),
                        description: t("seller.list.filtered.description"),
                    },
                }}
            />
        </Container>
    )
}

const columnHelper = createDataTableColumnHelper<VendorSeller>()

const useColumns = () => {
    const { t } = useTranslation('b2c')
    const navigate = useNavigate()
    const dialog = usePrompt();
    const { mutateAsync: suspendSeller } = useUpdateSeller();

    const handleSuspend = useCallback(
        async (seller: VendorSeller) => {
            const res = await dialog({
                title:
                    seller.store_status === 'SUSPENDED'
                        ? t('seller.actions.activate.title')
                        : t('seller.actions.suspend.title'),
                description:
                    seller.store_status === 'SUSPENDED'
                        ? t('seller.actions.activate.description')
                        : t('seller.actions.suspend.description'),
                verificationText: seller.email || seller.name || '',
                verificationInstruction: `${t('general.typeToConfirm1')} {val} ${t('general.typeToConfirm2')}`,
                confirmText: t('actions.confirm'),
                cancelText: t('actions.cancel')
            });

            if (!res) {
                return;
            }

            if (seller.store_status === 'SUSPENDED') {
                await suspendSeller({
                    id: seller.id,
                    data: { store_status: 'ACTIVE' }
                });
            } else {
                await suspendSeller({
                    id: seller.id,
                    data: { store_status: 'SUSPENDED' }
                });
            }
        },
        [t, prompt, suspendSeller]
    );

    const dateColumns = useDataTableDateColumns<VendorSeller>()

    return useMemo(
        () => [
            columnHelper.accessor('email', {
                header: () => t('fields.email'),
                enableSorting: true,
                sortLabel: t("fields.email"),
                sortAscLabel: t("filters.sorting.alphabeticallyAsc"),
                sortDescLabel: t("filters.sorting.alphabeticallyDesc"),
            }),
            columnHelper.accessor('name', {
                header: () => t('fields.name'),

            }),
            columnHelper.accessor('store_status', {
                header: () => t('seller.fields.store_status'),
                cell: ({ row }) => (
                    <SellerStatusBadge
                        status={row.original.store_status || 'pending'}
                        data-testid="seller-general-section-status-badge"
                    />
                )
            }),
            ...dateColumns,
            columnHelper.action({
                actions: (ctx) => [
                    {
                        icon: <PencilSquare />,
                        label: t('actions.edit'),
                        onClick: () => navigate(`${ctx.row.original.id}/edit`)
                    },
                    {
                        label:
                            ctx.row.original.store_status === 'SUSPENDED'
                                ? t('seller.actions.activate.title')
                                : t('seller.actions.suspend.title'),
                        onClick: () => handleSuspend(ctx.row.original),
                        icon: <User />
                    }
                ]
            })
        ],
        [t, navigate, dateColumns]
    )
}

const useFilters = () => {
    const dateFilters = useDataTableDateFilters()

    return useMemo(() => {
        return dateFilters
    }, [dateFilters])
}