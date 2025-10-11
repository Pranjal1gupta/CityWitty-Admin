// import { NextRequest, NextResponse } from 'next/server';
// import dbConnect from '@/lib/mongodb';
// import { Types } from 'mongoose';
// import Notification from '@/models/Notification';

// // Disable ISR / caching
// export const revalidate = 0;

// export async function GET(request: NextRequest) {
//   try {
//     await dbConnect();

//     const { searchParams } = new URL(request.url);
//     const search = searchParams.get('search') || '';
//     const typeFilter = searchParams.get('type') || 'all';
//     const audienceFilter = searchParams.get('audience') || 'all';
//     const page = parseInt(searchParams.get('page') || '1');
//     const limit = parseInt(searchParams.get('limit') || '10');

//     const query: any = {};
//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: 'i' } },
//         { message: { $regex: search, $options: 'i' } }
//       ];
//     }
//     if (typeFilter !== 'all') {
//       query.type = typeFilter;
//     }
//     if (audienceFilter !== 'all') {
//       query.target_audience = audienceFilter;
//     }

//     const skip = (page - 1) * limit;

//     const notifications = await Notification.find(query)
//       .sort({ created_at: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const total = await Notification.countDocuments(query);

//     // Calculate stats
//     const allNotifications = await Notification.find({}).lean();
//     const stats = {
//       total: allNotifications.length,
//       byType: {
//         info: allNotifications.filter(n => n.type === 'info').length,
//         alert: allNotifications.filter(n => n.type === 'alert').length,
//         update: allNotifications.filter(n => n.type === 'update').length,
//         promotion: allNotifications.filter(n => n.type === 'promotion').length,
//         warning: allNotifications.filter(n => n.type === 'warning').length,
//       },
//       unread: allNotifications.filter(n => n.status === 'sent').length, // Assuming unread if sent, adjust logic as needed
//     };

//     return NextResponse.json(
//       {
//         notifications: notifications.map(n => ({
//           ...n,
//           _id: (n._id as Types.ObjectId).toString(),
//           created_at: n.created_at.toISOString(),
//         })),
//         stats,
//         pagination: {
//           page,
//           limit,
//           total,
//           pages: Math.ceil(total / limit),
//         },
//       },
//       {
//         status: 200,
//         headers: { "Cache-Control": "no-store, max-age=0" },
//       }
//     );
//   } catch (error) {
//     console.error('Error fetching notifications:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch notifications' },
//       {
//         status: 500,
//         headers: { "Cache-Control": "no-store, max-age=0" },
//       }
//     );
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     await dbConnect();

//     const body = await request.json();
//     const { title, message, type, target_audience, target_ids, icon, additional_field, is_active, expires_at } = body;

//     const newNotification = new Notification({
//       title,
//       message,
//       type,
//       status: 'sent',
//       target_audience,
//       target_ids: target_ids || undefined,
//       icon,
//       additional_field: additional_field || undefined,
//       is_active: is_active !== undefined ? is_active : true,
//       expires_at: expires_at || undefined,
//     });

//     const savedNotification = await newNotification.save();

//     // Stub for delivery logic (e.g., send email/push)
//     console.log(`Notification sent to ${target_audience}: ${title}`);

//     return NextResponse.json({
//       success: true,
//       message: 'Notification sent successfully',
//       notification: {
//         ...savedNotification.toObject(),
//         _id: (savedNotification._id as Types.ObjectId).toString(),
//         created_at: savedNotification.created_at.toISOString(),
//       },
//     }, { status: 201 });

//   } catch (error) {
//     console.error('Error sending notification:', error);
//     let errorMessage = 'Failed to send notification';
//     if (error instanceof Error) {
//       errorMessage = error.message;
//     }
//     return NextResponse.json({
//       success: false,
//       message: errorMessage,
//     }, { status: 500 });
//   }
// }
