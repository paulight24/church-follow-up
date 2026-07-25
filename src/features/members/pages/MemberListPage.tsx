import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { Member, MemberFilters as MemberFiltersType } from '@/types/member';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { Card } from '@/components/ui/Card';
import { MemberFilters } from '@/features/members/components/MemberFilters';
import { MemberTable } from '@/features/members/components/MemberTable';
import { useDebounce } from '@/hooks/useDebounce';

const MOCK_MEMBERS: Member[] = [
  {
    id: '1',
    firstName: 'Adebayo',
    lastName: 'Ogunlade',
    preferredName: 'Bayo',
    email: 'adebayo.ogunlade@email.com',
    phone: '08012345678',
    gender: 'Male',
    dateOfBirth: '1985-03-15',
    address: '12 Victoria Island Drive',
    city: 'Lagos',
    state: 'Lagos',
    zipCode: '101001',
    memberStatus: 'ACTIVE',
    joinDate: '2022-01-10',
    baptismDate: '2022-06-15',
    salvationDate: '2021-12-25',
    department: 'Choir',
    occupation: 'Software Engineer',
    isActive: true,
    createdAt: '2022-01-10T08:00:00Z',
    updatedAt: '2026-07-01T12:00:00Z',
  },
  {
    id: '2',
    firstName: 'Chidinma',
    lastName: 'Okonkwo',
    preferredName: null,
    email: 'chidinma.okonkwo@email.com',
    phone: '08023456789',
    gender: 'Female',
    dateOfBirth: '1990-07-22',
    address: '5 Enugu Road',
    city: 'Enugu',
    state: 'Enugu',
    zipCode: '400001',
    memberStatus: 'REGULAR',
    joinDate: '2020-03-08',
    baptismDate: '2020-09-12',
    salvationDate: '2020-02-14',
    department: 'Ushering',
    occupation: 'Nurse',
    isActive: true,
    createdAt: '2020-03-08T08:00:00Z',
    updatedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: '3',
    firstName: 'Nnamdi',
    lastName: 'Eze',
    preferredName: null,
    email: 'nnamdi.eze@email.com',
    phone: '08034567890',
    gender: 'Male',
    dateOfBirth: '1978-11-03',
    address: '23 Aba Road',
    city: 'Port Harcourt',
    state: 'Rivers',
    zipCode: '500001',
    memberStatus: 'WORKER',
    joinDate: '2018-06-20',
    baptismDate: '2018-12-25',
    salvationDate: '2018-04-01',
    department: 'Media',
    occupation: 'Accountant',
    isActive: true,
    createdAt: '2018-06-20T08:00:00Z',
    updatedAt: '2026-07-10T09:00:00Z',
  },
  {
    id: '4',
    firstName: 'Folake',
    lastName: 'Adeyemi',
    preferredName: 'Fola',
    email: 'folake.adeyemi@email.com',
    phone: '08045678901',
    gender: 'Female',
    dateOfBirth: '1995-02-28',
    address: '8 Ikoyi Crescent',
    city: 'Lagos',
    state: 'Lagos',
    zipCode: '101233',
    memberStatus: 'FIRST_TIMER',
    joinDate: '2026-07-14',
    department: null,
    occupation: 'Marketing Manager',
    isActive: true,
    createdAt: '2026-07-14T08:00:00Z',
    updatedAt: '2026-07-14T08:00:00Z',
  },
  {
    id: '5',
    firstName: 'Emeka',
    lastName: 'Nwosu',
    preferredName: null,
    email: 'emeka.nwosu@email.com',
    phone: '08056789012',
    gender: 'Male',
    dateOfBirth: '1982-09-10',
    address: '15 Trans Amadi Road',
    city: 'Port Harcourt',
    state: 'Rivers',
    zipCode: '500102',
    memberStatus: 'ACTIVE',
    joinDate: '2021-11-05',
    baptismDate: '2022-04-17',
    salvationDate: '2021-10-10',
    department: 'Protocol',
    occupation: 'Civil Engineer',
    isActive: true,
    createdAt: '2021-11-05T08:00:00Z',
    updatedAt: '2026-05-20T14:00:00Z',
  },
  {
    id: '6',
    firstName: 'Amaka',
    lastName: 'Okoro',
    preferredName: null,
    email: 'amaka.okoro@email.com',
    phone: '08067890123',
    gender: 'Female',
    dateOfBirth: '1992-12-01',
    address: '3 GRA Phase 2',
    city: 'Benin City',
    state: 'Edo',
    zipCode: '300001',
    memberStatus: 'ACTIVE',
    joinDate: '2023-01-22',
    baptismDate: '2023-07-09',
    salvationDate: '2022-12-25',
    department: 'Children Ministry',
    occupation: 'Teacher',
    isActive: true,
    createdAt: '2023-01-22T08:00:00Z',
    updatedAt: '2026-06-30T11:00:00Z',
  },
  {
    id: '7',
    firstName: 'Oluwaseun',
    lastName: 'Bakare',
    preferredName: 'Seun',
    email: 'seun.bakare@email.com',
    phone: '08078901234',
    gender: 'Male',
    dateOfBirth: '1988-05-18',
    address: '42 Obafemi Awolowo Way',
    city: 'Ibadan',
    state: 'Oyo',
    zipCode: '200001',
    memberStatus: 'SECOND_TIMER',
    joinDate: '2026-07-07',
    department: null,
    occupation: 'Business Owner',
    isActive: true,
    createdAt: '2026-07-07T08:00:00Z',
    updatedAt: '2026-07-14T08:00:00Z',
  },
  {
    id: '8',
    firstName: 'Ngozi',
    lastName: 'Okafor',
    preferredName: null,
    email: 'ngozi.okafor@email.com',
    phone: '08089012345',
    gender: 'Female',
    dateOfBirth: '1975-08-30',
    address: '7 New Haven Extension',
    city: 'Enugu',
    state: 'Enugu',
    zipCode: '400211',
    memberStatus: 'WORKER',
    joinDate: '2015-03-15',
    baptismDate: '2015-08-20',
    salvationDate: '2015-01-01',
    department: 'Follow-Up',
    occupation: 'Pharmacist',
    isActive: true,
    createdAt: '2015-03-15T08:00:00Z',
    updatedAt: '2026-07-18T16:00:00Z',
  },
  {
    id: '9',
    firstName: 'Tunde',
    lastName: 'Afolabi',
    preferredName: null,
    email: 'tunde.afolabi@email.com',
    phone: '08090123456',
    gender: 'Male',
    dateOfBirth: '1998-01-05',
    address: '19 Lekki Phase 1',
    city: 'Lagos',
    state: 'Lagos',
    zipCode: '105102',
    memberStatus: 'NEW',
    joinDate: '2026-07-21',
    department: null,
    occupation: 'Student',
    isActive: true,
    createdAt: '2026-07-21T08:00:00Z',
    updatedAt: '2026-07-21T08:00:00Z',
  },
  {
    id: '10',
    firstName: 'Blessing',
    lastName: 'Eze',
    preferredName: null,
    email: 'blessing.eze@email.com',
    phone: '08001234567',
    gender: 'Female',
    dateOfBirth: '1993-04-12',
    address: '31 Wuse Zone 5',
    city: 'Abuja',
    state: 'FCT',
    zipCode: '900001',
    memberStatus: 'ACTIVE',
    joinDate: '2021-09-01',
    baptismDate: '2022-01-15',
    salvationDate: '2021-08-15',
    department: 'Hospitality',
    occupation: 'Banker',
    isActive: true,
    createdAt: '2021-09-01T08:00:00Z',
    updatedAt: '2026-07-05T13:00:00Z',
  },
  {
    id: '11',
    firstName: 'Obinna',
    lastName: 'Chukwu',
    preferredName: 'Obi',
    email: 'obinna.chukwu@email.com',
    phone: '07012345678',
    gender: 'Male',
    dateOfBirth: '1980-06-25',
    address: '14 Awka Road',
    city: 'Onitsha',
    state: 'Anambra',
    zipCode: '434001',
    memberStatus: 'INACTIVE',
    joinDate: '2019-04-07',
    baptismDate: '2019-10-20',
    salvationDate: '2019-03-01',
    department: 'Choir',
    occupation: 'Lawyer',
    isActive: false,
    createdAt: '2019-04-07T08:00:00Z',
    updatedAt: '2025-11-10T09:00:00Z',
  },
  {
    id: '12',
    firstName: 'Yetunde',
    lastName: 'Oladipo',
    preferredName: 'Yetty',
    email: 'yetunde.oladipo@email.com',
    phone: '09012345678',
    gender: 'Female',
    dateOfBirth: '1991-10-08',
    address: '6 Ring Road',
    city: 'Ibadan',
    state: 'Oyo',
    zipCode: '200212',
    memberStatus: 'REGULAR',
    joinDate: '2020-12-13',
    baptismDate: '2021-05-30',
    salvationDate: '2020-11-22',
    department: 'Evangelism',
    occupation: 'Doctor',
    isActive: true,
    createdAt: '2020-12-13T08:00:00Z',
    updatedAt: '2026-07-12T10:00:00Z',
  },
];

const PAGE_SIZE = 10;

export function MemberListPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<MemberFiltersType>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const debouncedSearch = useDebounce(search, 300);

  const filteredMembers = useMemo(() => {
    let result = [...MOCK_MEMBERS];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (m) =>
          m.firstName.toLowerCase().includes(q) ||
          m.lastName.toLowerCase().includes(q) ||
          (m.preferredName?.toLowerCase().includes(q) ?? false) ||
          (m.email?.toLowerCase().includes(q) ?? false) ||
          (m.phone?.includes(q) ?? false),
      );
    }

    if (filters.status) {
      result = result.filter((m) => m.memberStatus === filters.status);
    }
    if (filters.gender) {
      result = result.filter((m) => m.gender === filters.gender);
    }
    if (filters.department) {
      result = result.filter((m) =>
        m.department?.toLowerCase().includes(filters.department!.toLowerCase()),
      );
    }
    if (filters.isActive != null) {
      result = result.filter((m) => m.isActive === filters.isActive);
    }

    result.sort((a, b) => {
      let aVal: string;
      let bVal: string;

      switch (sortBy) {
        case 'name':
          aVal = `${a.firstName} ${a.lastName}`.toLowerCase();
          bVal = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'email':
          aVal = (a.email ?? '').toLowerCase();
          bVal = (b.email ?? '').toLowerCase();
          break;
        case 'phone':
          aVal = a.phone ?? '';
          bVal = b.phone ?? '';
          break;
        case 'memberStatus':
          aVal = a.memberStatus;
          bVal = b.memberStatus;
          break;
        case 'joinDate':
          aVal = a.joinDate ?? '';
          bVal = b.joinDate ?? '';
          break;
        case 'department':
          aVal = (a.department ?? '').toLowerCase();
          bVal = (b.department ?? '').toLowerCase();
          break;
        default:
          aVal = '';
          bVal = '';
      }

      const cmp = aVal.localeCompare(bVal);
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [debouncedSearch, filters, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleFilterChange = (newFilters: MemberFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        description="Manage church members"
        actions={
          <Link to="/members/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>Add Member</Button>
          </Link>
        }
      />

      <Card>
        <div className="space-y-4 p-4 sm:p-6">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, or phone..."
            className="max-w-md"
          />

          <MemberFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        <MemberTable
          members={paginatedMembers}
          isLoading={false}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />

        {filteredMembers.length > 0 && (
          <div className="border-t border-slate-100 px-4 py-4 sm:px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredMembers.length}
              pageSize={PAGE_SIZE}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
